import mongoose from 'mongoose';


/*
  Common reasons for ECONNREFUSED ::1:27017 when connecting to MongoDB:
  1. The MongoDB server is not listening on the IPv6 loopback (::1), but only on IPv4 (127.0.0.1).
  2. The connection string 'localhost' may resolve to ::1 (IPv6) on your system, but mongod is not bound to IPv6.
  3. The MongoDB server is not running, or is running on a different port.
  4. Firewall or security software is blocking the connection.

  Solutions:
  - Try using '127.0.0.1' instead of 'localhost' in your connection string.
  - Ensure mongod is running and listening on the expected interface and port.
  - Check your /etc/hosts file for how 'localhost' is resolved.
  - Check MongoDB logs for any errors.
*/

export async function connectDB() {
  try {
    // Use 127.0.0.1 to force IPv4 connection
    await mongoose.connect(process.env.MongoDb_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}
