using BusinessPlatform.Application.DTOs.Product;
using BusinessPlatform.Application.Interfaces.Inventory_Module;
using BusinessPlatform.Application.Interfaces.Product_Module;
using BusinessPlatform.Domain.Entities;
using BusinessPlatform.Domain.Exceptions;

namespace BusinessPlatform.Application.Services.Product_Module
{
    public class ProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly IInventory_Main_Repository _inventoryRepository;

        public ProductService(IProductRepository productRepository, IInventory_Main_Repository inventoryRepository)
        {
            _productRepository = productRepository;
            _inventoryRepository = inventoryRepository;
        }

        public async Task<ProductResponse> CreateAsync(CreateProductRequest request)
        {
            // Start Transaction
            await _productRepository.BeginTransactionAsync();

            try
            {
                // Category Validation
                var categoryExists = await _productRepository.CategoryExistsAsync(request.CategoryId);

                if (!categoryExists)
                    throw new NotFoundException("Category not found.");

                // SKU Validation
                var sku = await _productRepository.GetBySkuAsync(request.SKU);

                if (sku != null)
                    throw new BadRequestException("SKU already exists.");

                // Barcode Validation
                if (!string.IsNullOrWhiteSpace(request.Barcode))
                {
                    var barcode =  await _productRepository.GetByBarcodeAsync(request.Barcode);

                    if (barcode != null)
                        throw new BadRequestException("Barcode already exists.");
                }

                // Price Validation
                if (request.CostPrice < 0)
                    throw new BadRequestException("Cost price cannot be negative.");

                if (request.SellingPrice < 0)
                    throw new BadRequestException("Selling price cannot be negative.");

                if (request.SellingPrice < request.CostPrice)
                    throw new BadRequestException("Selling price cannot be less than cost price.");

                // Inventory Validation
                if (request.InitialStock < 0)
                    throw new BadRequestException("Initial stock cannot be negative.");

                if (request.MinimumStock < 0)
                    throw new BadRequestException("Minimum stock cannot be negative.");

                if (request.MaximumStock < 0)
                    throw new BadRequestException("Maximum stock cannot be negative.");

                if (request.ReorderLevel < 0)
                    throw new BadRequestException("Reorder level cannot be negative.");

                if (request.MinimumStock > request.MaximumStock)
                    throw new BadRequestException("Minimum stock cannot be greater than maximum stock.");

                if (request.ReorderLevel > request.MaximumStock)
                    throw new BadRequestException("Reorder level cannot be greater than maximum stock.");

                // Create Product
                var product = new Product
                {
                    Id = Guid.NewGuid(),
                    Name = request.Name.Trim(),
                    SKU = request.SKU.Trim(),
                    Barcode = request.Barcode,
                    Description = request.Description,
                    CategoryId = request.CategoryId,
                    CostPrice = request.CostPrice,
                    SellingPrice = request.SellingPrice,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                await _productRepository.AddAsync(product);

                await _productRepository.SaveChangesAsync();

                // Create Inventory
                var inventory = new Inventory
                {
                    Id = Guid.NewGuid(),
                    ProductId = product.Id,
                    QuantityInStock = request.InitialStock,
                    MinimumStock = request.MinimumStock,
                    MaximumStock = request.MaximumStock,
                    ReorderLevel = request.ReorderLevel,
                    UpdatedAt = DateTime.UtcNow
                };

                await _inventoryRepository.AddAsync(inventory);

                await _inventoryRepository.SaveChangesAsync();

                // Commit Transaction
                await _productRepository.CommitTransactionAsync();

                product = await _productRepository.GetByIdAsync(product.Id)
                    ?? throw new NotFoundException("Product not found.");

                return new ProductResponse
                {
                    Id = product.Id,
                    Name = product.Name,
                    SKU = product.SKU,
                    Barcode = product.Barcode,
                    CategoryId = product.CategoryId,
                    CategoryName = product.Category.Name,
                    CostPrice = product.CostPrice,
                    SellingPrice = product.SellingPrice,
                    IsActive = product.IsActive,
                    QuantityInStock = inventory.QuantityInStock,
                    MinimumStock = inventory.MinimumStock,
                    MaximumStock = inventory.MaximumStock,
                    ReorderLevel = inventory.ReorderLevel
                };
            }
            catch
            {
                await _productRepository.RollbackTransactionAsync();

                throw;
            }
        }

        public async Task<List<ProductResponse>> GetAllAsync()
        {
            var products = await _productRepository.GetAllAsync();

            return products.Select(product => new ProductResponse
            {
                Id = product.Id,
                Name = product.Name,
                SKU = product.SKU,
                Barcode = product.Barcode,
                CategoryId = product.CategoryId,
                CategoryName = product.Category.Name,
                CostPrice = product.CostPrice,
                SellingPrice = product.SellingPrice,
                IsActive = product.IsActive,
                QuantityInStock = product.Inventory?.QuantityInStock ?? 0,
                MinimumStock = product.Inventory?.MinimumStock ?? 0,
                MaximumStock = product.Inventory?.MaximumStock ?? 0,
                ReorderLevel = product.Inventory?.ReorderLevel ?? 0
            }).ToList();
        }

        public async Task<ProductResponse> GetByIdAsync(Guid id)
        {
            var product = await _productRepository.GetByIdAsync(id);

            if (product == null)
                throw new NotFoundException("Product not found.");

            return new ProductResponse
            {
                Id = product.Id,
                Name = product.Name,
                SKU = product.SKU,
                Barcode = product.Barcode,
                CategoryId = product.CategoryId,
                CategoryName = product.Category.Name,
                CostPrice = product.CostPrice,
                SellingPrice = product.SellingPrice,
                IsActive = product.IsActive,
                QuantityInStock = product.Inventory?.QuantityInStock ?? 0,
                MinimumStock = product.Inventory?.MinimumStock ?? 0,
                MaximumStock = product.Inventory?.MaximumStock ?? 0,
                ReorderLevel = product.Inventory?.ReorderLevel ?? 0
            };
        }

        public async Task<ProductResponse> UpdateAsync(Guid id,UpdateProductRequest request)
        {
            var product = await _productRepository.GetByIdAsync(id);

            if (product == null)
                throw new NotFoundException("Product not found.");

            if (!await _productRepository.CategoryExistsAsync(request.CategoryId))
                throw new NotFoundException("Category not found.");

            var sku = await _productRepository.GetBySkuAsync(request.SKU);

            if (sku != null && sku.Id != id)
                throw new BadRequestException("SKU already exists.");

            if (!string.IsNullOrWhiteSpace(request.Barcode))
            {
                var barcode =
                    await _productRepository.GetByBarcodeAsync(request.Barcode);

                if (barcode != null && barcode.Id != id)
                    throw new BadRequestException("Barcode already exists.");
            }

            if (request.CostPrice < 0)
                throw new BadRequestException("Cost price cannot be negative.");

            if (request.SellingPrice < request.CostPrice)
                throw new BadRequestException("Selling price cannot be less than cost price.");

            product.Name = request.Name.Trim();
            product.SKU = request.SKU.Trim();
            product.Barcode = request.Barcode;
            product.Description = request.Description;
            product.CategoryId = request.CategoryId;
            product.CostPrice = request.CostPrice;
            product.SellingPrice = request.SellingPrice;
            product.IsActive = request.IsActive;
            product.UpdatedAt = DateTime.UtcNow;

            _productRepository.Update(product);

            await _productRepository.SaveChangesAsync();

            return await GetByIdAsync(id);
        }

        public async Task DeleteAsync(Guid id)
        {
            var product = await _productRepository.GetByIdAsync(id);

            if (product == null)
                throw new NotFoundException("Product not found.");

            if (await _productRepository.HasSaleItemsAsync(id))
                throw new BadRequestException("Cannot delete product because it has been used in sales.");

            await _productRepository.DeleteAsync(product);

            await _productRepository.SaveChangesAsync();
        }

    }
}
