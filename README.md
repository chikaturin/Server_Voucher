# Server\_Voucher

Server\_Voucher là một hệ thống backend được xây dựng bằng Node.js, cho phép:

* Tạo và quản lý voucher.
* Xác thực mã voucher khi sử dụng.
* Giao tiếp với các hệ thống khác thông qua Kafka message queue.

### Đặc điểm

* Kiến trúc rõ ràng: Controller, Router, Middleware, Data, Schema.
* Sử dụng Kafka để đảm bảo tính mở rộng và hiệu quả giao tiếp.
* Hỗ trợ triển khai bằng Docker & docker-compose.
* Có thể deploy dễ dàng lên Vercel hoặc các nền tảng đám mây khác.

### Yêu cầu môi trường

* Node.js 14+
* Docker (nếu triển khai container)
* Kafka server (có thể qua Docker Compose)
* MongoDB hoặc hệ quản trị quan hệ tùy theo schema

### Cách chạy

1. Clone repo:

   ```bash
   git clone https://github.com/chikaturin/Server_Voucher.git
   cd Server_Voucher
   ```
