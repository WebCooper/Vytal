# Test Accounts Summary for Vytal Database

## Database Reset Completed Successfully ✅

The users table has been dropped and recreated with the new schema including:
- `id` (Primary Key)
- `name` (VARCHAR 100)
- `phone` (VARCHAR 20) 
- `email` (UNIQUE VARCHAR 100)
- `password_hash` (VARCHAR 255) - SHA2 encrypted
- `role` (ENUM: 'donor', 'receiver')
- `category` (ENUM: 'Organs', 'Medicines', 'Blood')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Test Accounts Available

All passwords are hashed using SHA2(password, 256):

1. **John Donor**
   - Email: `john.donor@vytal.com`
   - Password: `donor123`
   - Role: `donor`
   - Category: `Blood`
   - Phone: `+1234567890`

2. **Jane Receiver**
   - Email: `jane.receiver@vytal.com`
   - Password: `receiver123`
   - Role: `receiver`
   - Category: `Blood`
   - Phone: `+1234567891`

3. **Dr. Michael Smith**
   - Email: `dr.smith@vytal.com`
   - Password: `doctor123`
   - Role: `donor`
   - Category: `Organs`
   - Phone: `+1234567892`

4. **Mary Patient**
   - Email: `mary.patient@vytal.com`
   - Password: `patient123`
   - Role: `receiver`
   - Category: `Organs`
   - Phone: `+1234567893`

5. **Alex Pharmacy**
   - Email: `alex.pharmacy@vytal.com`
   - Password: `pharmacy123`
   - Role: `donor`
   - Category: `Medicines`
   - Phone: `+1234567894`

6. **Emma User**
   - Email: `emma.user@vytal.com`
   - Password: `user123`
   - Role: `receiver`
   - Category: `Medicines`
   - Phone: `+1234567895`

## Login Verification Tests ✅

- ✅ All 6 users can login successfully with correct credentials
- ✅ Wrong passwords are correctly rejected
- ✅ Database schema matches the registration requirements
- ✅ Role and category enums are working properly
- ✅ Password hashing is secure (SHA2-256)

## Next Steps

1. **Start Ballerina Backend**: `bal run` (requires Ballerina installation)
2. **Test API Endpoints**: Use the test accounts above
3. **Frontend Integration**: Test registration and login from the Next.js frontend
4. **Full System Test**: End-to-end user registration and authentication

## Database Connection

- Host: `localhost`
- Port: `3306`
- Database: `vytal_db`
- User: `root`
- Password: `1010` (updated in Config.toml)

The database is now ready for backend API testing!
