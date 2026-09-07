using BusinessPlatform.Application.DTOs.SaleReturn;
using BusinessPlatform.Application.Interfaces.Inventory_Module;
using BusinessPlatform.Application.Interfaces.Sales_Module;
using BusinessPlatform.Application.Interfaces.Unit_of_Work;
using BusinessPlatform.Domain.Entities;
using BusinessPlatform.Domain.Enums;
using BusinessPlatform.Domain.Exceptions;

namespace BusinessPlatform.Application.Services.Sale_Module
{
    public class SaleReturnService
    {
        private readonly ISaleRepository _saleRepository;
        private readonly ISaleReturnRepository _saleReturnRepository;
        private readonly IInventory_Main_Repository _inventoryRepository;
        private readonly IUnitOfWork _unitOfWork;

        public SaleReturnService(ISaleRepository saleRepository, ISaleReturnRepository saleReturnRepository, IInventory_Main_Repository inventoryRepository, IUnitOfWork unitOfWork)
        {
            _saleRepository = saleRepository;
            _saleReturnRepository = saleReturnRepository;
            _inventoryRepository = inventoryRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<SaleReturnResponse> CreateAsync(CreateSaleReturnRequest request)
        {

            if (request.Items == null || request.Items.Count == 0)
            {
                throw new BadRequestException("At least one product is required for a return.");
            }

            await _unitOfWork.BeginTransactionAsync();

            try
            {
                // Get the Original Sale
                var sale = await _saleRepository.GetByIdAsync(request.SaleId);

                if (sale == null)
                {
                    throw new NotFoundException("Sale not found.");
                }

                // cannot return the cancelled sale
                if (sale.Status == SaleStatus.Cancelled)
                {
                    throw new BadRequestException("A Cancelled sale cannot be returned.");
                }

                // get previous returns
                var previousReturns = await _saleReturnRepository.GetBySaleIdAsync(request.SaleId);

                // create return
                var saleReturn = new SaleReturn
                {
                    Id = Guid.NewGuid(),
                    SaleId = sale.Id,
                    ReturnNumber = GenerateReturnNumber(),
                    ReturnDate = DateTime.UtcNow,
                    Reason = request.Reason,
                    Status = ReturnStatus.Completed,
                    CreatedAt = DateTime.UtcNow
                };

                decimal totalRefund = 0;

                foreach (var requestItem in request.Items)
                {
                    if (requestItem.Quantity <= 0)
                    {
                        throw new BadRequestException("Return quantity must be greater than zero.");
                    }

                    // Find original sale item
                    var saleItem = sale.SaleItems.FirstOrDefault(x => x.ProductId == requestItem.ProductId);

                    if (saleItem == null)
                    {
                        throw new BadRequestException("Product was not part of the original sale.");
                    }

                    // How much was already returned?
                    var alreadyReturned = previousReturns.SelectMany(x => x.Items).Where(x => x.ProductId == requestItem.ProductId).Sum(x => x.Quantity);

                    //Remaining quantity that can be returned 
                    var remainingQuantity = saleItem.Quantity - alreadyReturned;

                    if (requestItem.Quantity > remainingQuantity)
                    {
                        throw new BadRequestException(
                            $"Cannot return {requestItem.Quantity} units. " +
                            $"Only {remainingQuantity} units are available for return.");
                    }

                    // Use original sale price
                    var refundAmount = saleItem.UnitPrice * requestItem.Quantity;

                    var returnItem = new SaleReturnItem
                    {
                        Id = Guid.NewGuid(),
                        SaleReturnId = saleReturn.Id,
                        ProductId = saleItem.ProductId,
                        Quantity = requestItem.Quantity,
                        UnitPrice = saleItem.UnitPrice,
                        Total = refundAmount
                    };

                    saleReturn.Items.Add(returnItem);

                    totalRefund += refundAmount;

                    // restore inventory
                    var inventory = await _inventoryRepository.GetByProductIdAsync(saleItem.ProductId);

                    if (inventory == null)
                    {
                        throw new BadRequestException($"Inventory not found for product {saleItem.ProductId}.");
                    }

                    inventory.QuantityInStock += requestItem.Quantity;

                    inventory.UpdatedAt = DateTime.UtcNow;

                    _inventoryRepository.Update(inventory);
                }

                saleReturn.TotalAmount = totalRefund;

                // 7. Save return
                await _saleReturnRepository.AddAsync(saleReturn);

                // 8. Save all changes
                await _unitOfWork.SaveChangesAsync();

                // 9. Commit
                await _unitOfWork.CommitTransactionAsync();

                return MapToResponse(saleReturn);
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync();

                throw;
            }
        }

        public async Task<SaleReturnResponse> GetByIdAsync(Guid id)
        {
            var saleReturn =
                await _saleReturnRepository.GetByIdAsync(id);

            if (saleReturn == null)
            {
                throw new NotFoundException(
                    "Sale return not found.");
            }

            return MapToResponse(saleReturn);
        }

        public async Task<List<SaleReturnResponse>> GetBySaleIdAsync(Guid saleId)
        {
            var sale = await _saleRepository.GetByIdAsync(saleId);

            if (sale == null)
            {
                throw new NotFoundException("Sale not found.");
            }

            var returns = await _saleReturnRepository.GetBySaleIdAsync(saleId);

            return returns.Select(MapToResponse).ToList();
        }

        private static string GenerateReturnNumber()
        {
            var timeStamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");

            var random = Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper();

            return $"RET-{timeStamp}-{random}";
        }
        private static SaleReturnResponse MapToResponse(SaleReturn saleReturn)
        {
            return new SaleReturnResponse
            {
                Id = saleReturn.Id,

                SaleId = saleReturn.SaleId,

                ReturnNumber = saleReturn.ReturnNumber,

                ReturnDate = saleReturn.ReturnDate,

                TotalAmount = saleReturn.TotalAmount,

                Status = saleReturn.Status,

                Reason = saleReturn.Reason,

                Items = saleReturn.Items.Select(x => new SaleReturnItemResponse
                {
                    ProductId = x.ProductId,

                    ProductName = x.Product.Name,

                    Quantity = x.Quantity,

                    UnitPrice = x.UnitPrice,

                    Total = x.Total
                }).ToList()
            };
        }


    }
}
