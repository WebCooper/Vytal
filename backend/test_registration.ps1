# Test Registration Endpoint

Let me test the user registration functionality:

```powershell
$body = @{
    name = "John Doe"
    phone_number = "+1234567890"
    email = "john.doe@example.com"
    password = "password123"
    role = "donor"
    categories = @("Organic", "Medicines")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/register" -Method POST -Body $body -ContentType "application/json"
```
