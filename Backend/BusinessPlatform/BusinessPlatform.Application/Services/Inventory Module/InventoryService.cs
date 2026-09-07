using BusinessPlatform.Application.DTOs.Inventory_Module;
using BusinessPlatform.Application.Interfaces.Inventory_Module;
using BusinessPlatform.Domain.Exceptions;

namespace BusinessPlatform.Application.Services.Inventory_Module
{
    public class InventoryService
    {

        private readonly IInventory_Main_Repository _inventoryRepository;

        public InventoryService(IInventory_Main_Repository inventoryRepository)
        {
            _inventoryRepository = inventoryRepository;
        }

        public async Task<List<InventoryResponse>> GetAllAsync()
        {
            var inventories = await _inventoryRepository.GetAllAsync();

            return inventories.Select(i => new InventoryResponse
            {
                ProductId = i.ProductId,
                ProductName = i.Product.Name,
                SKU = i.Product.SKU,
                QuantityInStock = i.QuantityInStock,
                MinimumStock = i.MinimumStock,
                MaximumStock = i.MaximumStock,
                ReorderLevel = i.ReorderLevel,
                LastUpdated = i.UpdatedAt
            }).ToList();
        }

        public async Task<InventoryResponse> GetByProductIdAsync(Guid productId)
        {
            var inventory =
                await _inventoryRepository.GetByProductIdAsync(productId);

            if (inventory == null)
                throw new NotFoundException("Inventory not found.");

            return new InventoryResponse
            {
                ProductId = inventory.ProductId,
                ProductName = inventory.Product.Name,
                SKU = inventory.Product.SKU,
                QuantityInStock = inventory.QuantityInStock,
                MinimumStock = inventory.MinimumStock,
                MaximumStock = inventory.MaximumStock,
                ReorderLevel = inventory.ReorderLevel,
                LastUpdated = inventory.UpdatedAt
            };
        }

        public async Task IncreaseStockAsync(IncreaseStockRequest request)
        {
            if (request.Quantity <= 0)
                throw new BadRequestException("Quantity must be greater than zero.");

            var inventory = await _inventoryRepository.GetByProductIdAsync(request.ProductId);

            if (inventory == null)
                throw new NotFoundException("Inventory not found.");

            inventory.QuantityInStock += request.Quantity;

            inventory.UpdatedAt = DateTime.UtcNow;

            _inventoryRepository.Update(inventory);

            await _inventoryRepository.SaveChangesAsync();
        }

        public async Task DecreaseStockAsync(DecreaseStockRequest request)
        {
            if (request.Quantity <= 0)
                throw new BadRequestException("Quantity must be greater than zero.");

            var inventory = await _inventoryRepository.GetByProductIdAsync(request.ProductId);

            if (inventory == null)
                throw new NotFoundException("Inventory not found.");

            if (inventory.QuantityInStock < request.Quantity)
                throw new BadRequestException("Insufficient Stock");

            inventory.QuantityInStock -= request.Quantity;

            inventory.UpdatedAt = DateTime.UtcNow;

            _inventoryRepository.Update(inventory);

            await _inventoryRepository.SaveChangesAsync();
        }

        public async Task AdjustStockAsync(AdjustStockRequest request)
        {
            if (request.NewQuantity < 0)
                throw new BadRequestException("Stock cannot be negative.");

            var inventory =
                await _inventoryRepository.GetByProductIdAsync(request.ProductId);

            if (inventory == null)
                throw new NotFoundException("Inventory not found.");

            inventory.QuantityInStock = request.NewQuantity;

            inventory.UpdatedAt = DateTime.UtcNow;

            _inventoryRepository.Update(inventory);

            await _inventoryRepository.SaveChangesAsync();
        }

        public async Task UpdateInventorySettingsAsync(Guid productId,UpdateInventoryRequest request)
        {
            var inventory = await _inventoryRepository.GetByProductIdAsync(productId);

            if (inventory == null)
                throw new NotFoundException("Inventory not found.");

            if (request.MinimumStock < 0)
                throw new BadRequestException("Minimum stock cannot be negative.");

            if (request.MaximumStock < 0)
                throw new BadRequestException("Maximum stock cannot be negative.");

            if (request.ReorderLevel < 0)
                throw new BadRequestException("Reorder level cannot be negative.");

            if (request.MinimumStock > request.MaximumStock)
                throw new BadRequestException("Minimum stock cannot exceed maximum stock.");

            if (request.ReorderLevel > request.MaximumStock)
                throw new BadRequestException("Reorder level cannot exceed maximum stock.");

            inventory.MinimumStock = request.MinimumStock;

            inventory.MaximumStock = request.MaximumStock;

            inventory.ReorderLevel = request.ReorderLevel;

            inventory.UpdatedAt = DateTime.UtcNow;

            _inventoryRepository.Update(inventory);

            await _inventoryRepository.SaveChangesAsync();
        }

        public async Task<List<InventoryResponse>> GetLowStockAsync()
        {
            var inventories = await _inventoryRepository.GetLowStockAsync();

            return inventories.Select(i => new InventoryResponse
            {
                ProductId = i.ProductId,
                ProductName = i.Product.Name,
                SKU = i.Product.SKU,
                QuantityInStock = i.QuantityInStock,
                MinimumStock = i.MinimumStock,
                MaximumStock = i.MaximumStock,
                ReorderLevel = i.ReorderLevel,
                LastUpdated = i.UpdatedAt
            }).ToList();
        }

        public async Task<List<InventoryResponse>> GetOutOfStockAsync()
        {
            var inventories = await _inventoryRepository.GetOutOfStockAsync();

            return inventories.Select(i => new InventoryResponse
            {
                ProductId = i.ProductId,
                ProductName = i.Product.Name,
                SKU = i.Product.SKU,
                QuantityInStock = i.QuantityInStock,
                MinimumStock = i.MinimumStock,
                MaximumStock = i.MaximumStock,
                ReorderLevel = i.ReorderLevel,
                LastUpdated = i.UpdatedAt
            }).ToList();
        }


    }
}
