using BusinessPlatform.Application.DTOs.Sale_Module;
using BusinessPlatform.Application.Interfaces.Customer_Module;
using BusinessPlatform.Application.Interfaces.Inventory_Module;
using BusinessPlatform.Application.Interfaces.Product_Module;
using BusinessPlatform.Application.Interfaces.Sales_Module;
using BusinessPlatform.Application.Interfaces.Unit_of_Work;
using BusinessPlatform.Domain.Entities;
using BusinessPlatform.Domain.Enums;
using BusinessPlatform.Domain.Exceptions;
using System;

namespace BusinessPlatform.Application.Services
{
    public class SaleService
    {
        private readonly ISaleRepository _saleRepository;
        private readonly ICustomerRepository _customerRepository;
        private readonly IProductRepository _productRepository;
        private readonly IInventory_Main_Repository _inventoryRepository;
        private readonly IUnitOfWork _unitOfWork;

        public SaleService(ISaleRepository saleRepository, ICustomerRepository customerRepository, IProductRepository productRepository, IInventory_Main_Repository inventoryRepository, IUnitOfWork unitOfWork)
        {
            _saleRepository = saleRepository;
            _customerRepository = customerRepository;
            _productRepository = productRepository;
            _inventoryRepository = inventoryRepository;
            _unitOfWork = unitOfWork;
        }

        // =========================================================
        // CREATE SALE
        // =========================================================

        public async Task<SaleResponse> CreateAsync(
            CreateSaleRequest request)
        {
            // -----------------------------------------------------
            // 1. Basic validation
            // -----------------------------------------------------

            if (request.Items == null || request.Items.Count == 0)
            {
                throw new BadRequestException("Sale must contain at least one product.");
            }

            if (request.Payments == null || request.Payments.Count == 0)
            {
                throw new BadRequestException("Sale must contain at least one payment.");
            }

            if (request.Items.Any(x => x.Quantity <= 0))
            {
                throw new BadRequestException("Product quantity must be greater than zero.");
            }

            if (request.Discount < 0)
            {
                throw new BadRequestException("Sale discount cannot be negative.");
            }

            if (request.Tax < 0)
            {
                throw new BadRequestException("Tax cannot be negative.");
            }

            // -----------------------------------------------------
            // 2. Start transaction
            // -----------------------------------------------------

            await _unitOfWork.BeginTransactionAsync();

            try
            {
                // -------------------------------------------------
                // 3. Validate customer
                // -------------------------------------------------

                var customer =
                    await _customerRepository.GetByIdAsync(
                        request.CustomerId);

                if (customer == null)
                {
                    throw new NotFoundException("Customer not found.");
                }

                if (!customer.IsActive)
                {
                    throw new BadRequestException("Customer is inactive.");
                }

                // -------------------------------------------------
                // 4. Create Sale
                // -------------------------------------------------

                var sale = new Sale
                {
                    Id = Guid.NewGuid(),

                    InvoiceNumber = GenerateInvoiceNumber(),

                    CustomerId = customer.Id,

                    SaleDate = DateTime.UtcNow,

                    Discount = request.Discount,

                    Tax = request.Tax,

                    Remarks = request.Remarks,

                    PaymentStatus = PaymentStatus.Pending,

                    CreatedAt = DateTime.UtcNow
                };

                decimal subtotal = 0;

                // -------------------------------------------------
                // 5. Process Sale Items
                // -------------------------------------------------

                foreach (var itemRequest in request.Items)
                {
                    var product =
                        await _productRepository
                            .GetByIdAsync(itemRequest.ProductId);

                    if (product == null)
                    {
                        throw new NotFoundException($"Product with ID {itemRequest.ProductId} not found.");
                    }

                    if (!product.IsActive)
                    {
                        throw new BadRequestException($"Product '{product.Name}' is inactive.");
                    }

                    // ---------------------------------------------
                    // Check inventory
                    // ---------------------------------------------

                    var inventory =
                        await _inventoryRepository
                            .GetByProductIdAsync(product.Id);

                    if (inventory == null)
                    {
                        throw new BadRequestException($"Inventory not found for product '{product.Name}'.");
                    }

                    if (inventory.QuantityInStock <
                        itemRequest.Quantity)
                    {
                        throw new BadRequestException(
                            $"Insufficient stock for '{product.Name}'. " +
                            $"Available: {inventory.QuantityInStock}, " +
                            $"Requested: {itemRequest.Quantity}.");
                    }

                    // ---------------------------------------------
                    // Calculate item total
                    // ---------------------------------------------

                    var itemSubtotal =
                        product.SellingPrice *
                        itemRequest.Quantity;

                    if (itemRequest.Discount < 0)
                    {
                        throw new BadRequestException(
                            "Item discount cannot be negative.");
                    }

                    if (itemRequest.Discount > itemSubtotal)
                    {
                        throw new BadRequestException(
                            $"Discount cannot exceed price of '{product.Name}'.");
                    }

                    var itemTotal =
                        itemSubtotal -
                        itemRequest.Discount;

                    // ---------------------------------------------
                    // Create SaleItem
                    // ---------------------------------------------

                    var saleItem = new SaleItem
                    {
                        Id = Guid.NewGuid(),

                        SaleId = sale.Id,

                        ProductId = product.Id,

                        Quantity = itemRequest.Quantity,

                        // Price snapshot
                        UnitPrice = product.SellingPrice,

                        Discount = itemRequest.Discount,

                        Tax = 0,

                        Total = itemTotal
                    };

                    sale.SaleItems.Add(saleItem);

                    subtotal += itemTotal;

                    // ---------------------------------------------
                    // Reduce Inventory
                    // ---------------------------------------------

                    inventory.QuantityInStock -=
                        itemRequest.Quantity;

                    inventory.UpdatedAt =
                        DateTime.UtcNow;

                    _inventoryRepository.Update(inventory);
                }

                // -------------------------------------------------
                // 6. Calculate Sale Total
                // -------------------------------------------------

                sale.SubTotal = subtotal;

                sale.GrandTotal =
                    sale.SubTotal
                    - sale.Discount
                    + sale.Tax;

                if (sale.GrandTotal < 0)
                {
                    throw new BadRequestException(
                        "Grand total cannot be negative.");
                }

                // -------------------------------------------------
                // 7. Process Payments
                // -------------------------------------------------

                decimal totalPaid = 0;

                foreach (var paymentRequest in request.Payments)
                {
                    if (paymentRequest.Amount <= 0)
                    {
                        throw new BadRequestException(
                            "Payment amount must be greater than zero.");
                    }

                    totalPaid += paymentRequest.Amount;

                    var payment = new Payment
                    {
                        Id = Guid.NewGuid(),

                        SaleId = sale.Id,

                        Amount = paymentRequest.Amount,

                        Method = paymentRequest.Method,

                        Status = PaymentStatus.Paid,

                        TransactionReference =
                            paymentRequest.TransactionReference,

                        PaymentDate = DateTime.UtcNow
                    };

                    sale.Payments.Add(payment);
                }

                // -------------------------------------------------
                // 8. Determine payment status
                // -------------------------------------------------

                if (totalPaid > sale.GrandTotal)
                {
                    throw new BadRequestException(
                        "Payment amount cannot exceed sale total.");
                }

                if (totalPaid == sale.GrandTotal)
                {
                    sale.PaymentStatus =
                        PaymentStatus.Paid;
                }
                else
                {
                    sale.PaymentStatus =
                        PaymentStatus.PartiallyPaid;
                }

                // -------------------------------------------------
                // 9. Add Sale
                // -------------------------------------------------

                await _saleRepository.AddAsync(sale);

                // -------------------------------------------------
                // 10. Save everything
                // -------------------------------------------------

                await _unitOfWork.SaveChangesAsync();

                // -------------------------------------------------
                // 11. Commit transaction
                // -------------------------------------------------

                await _unitOfWork.CommitTransactionAsync();

                // -------------------------------------------------
                // 12. Return response
                // -------------------------------------------------

                return MapToResponse(sale, customer);
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync();

                throw;
            }
        }

        // =========================================================
        // GET BY ID
        // =========================================================

        public async Task<SaleResponse> GetByIdAsync(Guid id)
        {
            var sale =
                await _saleRepository.GetByIdAsync(id);

            if (sale == null)
            {
                throw new NotFoundException(
                    "Sale not found.");
            }

            return MapToResponse(
                sale,
                sale.Customer);
        }

        // =========================================================
        // GET ALL
        // =========================================================

        public async Task<List<SaleResponse>> GetAllAsync()
        {
            var sales =
                await _saleRepository.GetAllAsync();

            return sales
                .Select(x =>
                    MapToResponse(x, x.Customer))
                .ToList();
        }

        // =========================================================
        // INVOICE NUMBER
        // =========================================================

        private static string GenerateInvoiceNumber()
        {
            var date =
                DateTime.UtcNow.ToString("yyyyMMddHHmmss");

            var randomPart =
                Guid.NewGuid()
                    .ToString("N")
                    .Substring(0, 6)
                    .ToUpper();

            return $"INV-{date}-{randomPart}";
        }

        // =========================================================
        // MAPPING
        // =========================================================

        private static SaleResponse MapToResponse(Sale sale,Customer customer)
        {
            return new SaleResponse
            {
                Id = sale.Id,

                InvoiceNumber = sale.InvoiceNumber,

                CustomerId = sale.CustomerId,

                CustomerName = $"{customer.FirstName} {customer.LastName}",

                SaleDate = sale.SaleDate,

                SubTotal = sale.SubTotal,

                Discount = sale.Discount,

                Tax = sale.Tax,

                GrandTotal = sale.GrandTotal,

                PaymentStatus = sale.PaymentStatus,

                Status = sale.Status,

                Remarks = sale.Remarks,

                Items = sale.SaleItems.Select(item => new SaleItemResponse
                {
                    ProductId = item.ProductId,

                    ProductName = item.Product.Name,

                    Quantity = item.Quantity,

                    UnitPrice = item.UnitPrice,

                    Discount = item.Discount,

                    Tax = item.Tax,

                    Total = item.Total
                }).ToList(),

                Payments = sale.Payments
                        .Select(payment => new PaymentResponse
                        {
                            Id = payment.Id,

                            Amount = payment.Amount,

                            Method = payment.Method,

                            Status = payment.Status,

                            TransactionReference = payment.TransactionReference,

                            PaymentDate = payment.PaymentDate
                        }).ToList()
            };
        }

        public async Task CancelAsync(Guid saleId)
        {
            await _unitOfWork.BeginTransactionAsync();

            try
            {
                // 1. Find sale
                var sale = await _saleRepository.GetByIdAsync(saleId);

                if (sale == null)
                {
                    throw new NotFoundException("Sale not found.");
                }

                // 2. Check whether already cancelled
                if (sale.Status == SaleStatus.Cancelled)
                {
                    throw new BadRequestException("Sale is already cancelled.");
                }

                // 3. Restore inventory
                foreach (var saleItem in sale.SaleItems)
                {
                    var inventory = await _inventoryRepository.GetByProductIdAsync(saleItem.ProductId);

                    if (inventory == null)
                    {
                        throw new BadRequestException(
                            $"Inventory not found for product {saleItem.ProductId}.");
                    }

                    inventory.QuantityInStock += saleItem.Quantity;

                    inventory.UpdatedAt = DateTime.UtcNow;

                    _inventoryRepository.Update(inventory);
                }

                // 4. Cancel sale
                sale.Status = SaleStatus.Cancelled;

                sale.UpdatedAt = DateTime.UtcNow;

                _saleRepository.Update(sale);

                // 5. Save everything
                await _unitOfWork.SaveChangesAsync();

                // 6. Commit
                await _unitOfWork.CommitTransactionAsync();
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync();

                throw;
            }
        }
    }
}