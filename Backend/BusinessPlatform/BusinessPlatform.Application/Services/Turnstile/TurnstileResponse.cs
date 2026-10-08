using System.Text.Json.Serialization;

public class TurnstileResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("error-codes")]
    public List<string> ErrorCodes { get; set; } = [];
}