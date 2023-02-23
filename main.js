// Import essential libraries
const http = require('http');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');

// create port
const port = 3000;

const productData = [
    {id: 1, name: 'Iphone 14 Pro Max', price: '37,000,000', description: 'Hàng xách tay Mỹ'},
    {id: 2, name: 'Iphone 13 Pro Max', price: '25,000,000', description: 'Hàng xách tay Úc'},
    {id: 3, name: 'Samsung Galaxy ZFlip', price: '22,000,000', description: 'Hàng xách tay Nhật'},
    {id: 4, name: 'Xiaomi Mi 12', price: '20,000,000', description: 'Hàng xách tay Trung'},
    {id: 5, name: 'Sony Xperia Z', price: '15,000,000', description: 'Hàng xách tay Hàn'},
    {id: 6, name: 'Ipad mini 6', price: '18,000,000', description: 'Hàng chính hãng Apple'}
];

// create flagLogin
let flagLogin = true;

// create server
const server = http.createServer((req, res) => {
    if (req.url === '/') {
        if (!flagLogin) {
            // user is not logged in, redirect to login page
            res.writeHead(302, {'Location': '/login'});
            res.end();
        } 
        else { // user is logged in, serve the home page
            res.writeHead(200, {'Content-Type': 'text/html'});
            // read file html login
            fs.readFile(path.join(__dirname, 'views/trangchu.html'), (err, data) => {
                // error
                if (err) throw err;
                // write data and send response to client
                res.write(data);

                // Generate a dynamic table
                let tableRows = '';
                for (const product of productData) {
                    tableRows += 
                    `<tr>
                        <td>${product.id}</td>
                        <td>${product.name}</td>
                        <td>${product.price}</td>
                        <td>${product.description}</td>
                        <td>
                            <a class="link-primary" onclick="location.href='/add'">Chỉnh sửa</a>
                            |
                            <a class="link-success" onclick="location.href='/product/${product.id}'">Chi tiết</a>
                            |
                            <a class="link-danger" onclick="location.href='/delete/${product.id}'">Xoá</a>
                        </td>
                    </tr>`;
                }
                res.write(`
                    <body>
                        <div class="container mt-3">
                        <h3 class="mb-3 text-primary">Danh sách sản phẩm</h3>
                        <button class="btn btn-success" onclick="location.href='/add'">Thêm sản phẩm</button>       
                        <h5 class="mt-3 mb-3">Chọn một sản phẩm cụ thể để xem chi tiết</h5>
                        <table class="table table-striped" id="product-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Giá</th>
                                    <th>Mô tả</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody id="productTableBody">
                                ${tableRows}
                            </tbody>
                        </table>
                        </div> 
                        
                    </body>
                `);

                res.end();
            })
        }
    }
    // if req has url is "/"
    if (req.url === '/login') {
        res.writeHead(200, {'Content-Type': 'text/html'});

        // read file html login
        fs.readFile(path.join(__dirname, 'views/login.html'), (err, data) => {
            // error
            if (err) throw err;
            // write data and send response to client
            res.write(data);
            // end response
            res.end();
        });
    }
    // if req has url is "/login" and req.method is POST
    if (req.url === '/login' && req.method === 'POST') {
        // get data from post request
        let body = '';
        // collect chunks of data and merge them into one string
        req.on('data', (chunk) => body += chunk.toString());

        req.on('end', () => {
            // parse string into object; parse url query string
            const { emailField, passField } = querystring.parse(body);

            if (emailField === "a@gmail.com" && passField === "a") {
                flagLogin = true; // set the flag to true
                // res.write('Log in successfully')
                res.writeHead(302, {'Location': '/'});
                res.end();
            } 
            else if (emailField === "a@gmail.com" && passField != "a") {
                res.write('Passwords incorrect')
                res.end();
            } 
        });
    }

    if (req.url === '/add' && req.method === 'GET') {
        res.writeHead(200, {'Content-Type': 'text/html'});

        // read file html login
        fs.readFile(path.join(__dirname, 'views/add.html'), (err, data) => {
            // error
            if (err) throw err;
            // write data and send response to client
            res.write(data);
            // end response
            res.end();
        });
    }
    if (req.url === '/add' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { pname, pprice, ptextarea } = querystring.parse(body);
            const product = {
                id: productData.length + 1,
                name: pname,
                price: pprice,
                description: ptextarea
            };
            productData.push(product);
            res.writeHead(302, { Location: '/' }); // Redirect to the home page
            res.end(); 
        });         
    }   

    // localhost:3000/product/1
    if (req.url.startsWith('/product/')) {
        // get the product ID from the request URL
        const productId = parseInt(req.url.split('/')[2]);
        console.log(productId);

        // find the product with the given ID
        const product = productData.find(p => p.id === productId);
        console.log(product);

        if (product) {
            // read the product detail HTML file
            fs.readFile(path.join(__dirname, 'views/product.html'), 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500);
                    return res.end('Error loading product detail page');
                }

            // replace the placeholders with the actual data of the product
            const html = `
            <body>
                <h1>Chi tiet san pham</h1>
                <div>
                <h2>Id san pham</h2>
                <p>${product.id}</p>
                </div>
                <div>
                <h2>Ten san pham</h2>
                <p>${product.name}</p>
                </div>
                <div>
                <h2>Gia san pham</h2>
                <p>${product.price}</p>
                </div>
                <div>
                <h2>Mo ta san pham</h2>
                <p>${product.description}</p>
                </div>
                <a href="/">Tro ve trang chu</a>
            </body>`

            // send the HTML response to the client
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(html);
        });
        } else {
            // if the product is not found, send a 404 response
            res.writeHead(404);
            res.end('Product not found');
        }
    }

    if (req.url.startsWith('/delete/')) {
        // get the product ID from the request URL
        const productId = parseInt(req.url.split('/')[2]);
      
        // find the product with the given ID
        const productIndex = productData.findIndex(p => p.id === productId);
      
        if (productIndex >= 0) {
          // remove the product from the array
          productData.splice(productIndex, 1);
        
          // redirect the user to the product list page
          res.writeHead(302, {'Location': '/'});
          return res.end();
        } else {
          // if the product is not found, send a 404 response
          res.writeHead(404);
          res.end('Product not found');
        }
      }
      
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// const http = require('http');
// const url = require('url');
// const qs = require('querystring');

// let products = []; // This array will store the product data in memory

// // Create a server to handle incoming requests
// http.createServer((req, res) => {
//   const { pathname } = url.parse(req.url);

//   // If the request is for the home page, display the product form and table
//   if (pathname === '/') {
//     // If the form was submitted, add the product to the array
//     if (req.method === 'POST') {
//       let body = '';
//       req.on('data', chunk => {
//         body += chunk.toString();
//       });
//       req.on('end', () => {
//         const { pname, pprice, ptextarea } = qs.parse(body);
//         const product = {
//           id: products.length + 1,
//           name: pname,
//           price: pprice,
//           description: ptextarea
//         };
//         products.push(product);
//         res.writeHead(302, { Location: '/' }); // Redirect to the home page
//         res.end();
//       });
//     } else {
//       // If the request is a GET request, display the product form and table
//       let tableRows = '';
//       for (let i = 0; i < products.length; i++) {
//         const product = products[i];
//         tableRows += `
//           <tr>
//             <td>${i + 1}</td>
//             <td>${product.name}</td>
//             <td>${product.price}</td>
//             <td>${product.description}</td>
//           </tr>
//         `;
//       }
//       const html = `
//         <html>
//         <head>
//           <title>Add Product</title>
//         </head>
//         <body>
//           <form method="POST">
//             <div>
//               <label for="pname">Product Name</label>
//               <input type="text" id="pname" name="pname">
//             </div>
//             <div>
//               <label for="pprice">Product Price</label>
//               <input type="text" id="pprice" name="pprice">
//             </div>
//             <div>
//               <label for="ptextarea">Product Description</label>
//               <textarea id="ptextarea" name="ptextarea"></textarea>
//             </div>
//             <button type="submit">Add Product</button>
//           </form>
//           <table>
//             <thead>
//               <tr>
//                 <th>STT</th>
//                 <th>Product Name</th>
//                 <th>Product Price</th>
//                 <th>Product Description</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${tableRows}
//             </tbody>
//           </table>
//         </body>
//         </html>
//       `;
//       res.writeHead(200, { 'Content-Type': 'text/html' });
//       res.write(html);
//       res.end();
//     }
//   } else {
//     // If the request is for a different page, return a 404 error
//     res.writeHead(404, { 'Content-Type': 'text/plain' });
//     res.write('404 Not Found');
//     res.end();
//   }
// }).listen(3000, () => {
//   console.log('Server is running on port 3000');
// });
