using Xunit;

namespace BusinessPlatform.Tests
{
    public class BasicTests
    {
        [Fact]
        public void TwoNumbers_WhenAdded_ReturnsCorrectSum()
        {
            // Arrange
            int firstNumber = 10;
            int secondNumber = 20;

            // Act
            int result = firstNumber + secondNumber;

            // Assert
            Assert.Equal(30, result);
        }
    }
}
