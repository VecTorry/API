const express = require('express')

const app = express();

const port = 4000;

app.use(express.json());

let users = [
	{
		email:"wuChang@email.com",
		username: "wuChang",
		password: "Rhy",
		isAdmin: false,
		orders: []
	},
	{
		email:"lee@email.com",
		username: "lee",
		password: "Bueno",
		isAdmin: false,
		orders: []
	},
	{
		email:"victor@email.com",
		username: "victor",
		password: "admin",
		isAdmin: true,
		orders: []
	},
];

let products = [];

let loggedUser;

app.get('/', (req, res) =>
{
	res.send('Welcome.');
});

app.get('/test', (req, res) =>
{
	res.send('Testing');
});

app.get('/users', (req, res) =>
{
	console.log(users);
	res.send(users);
});

app.get('/products', (req, res) =>
{
	if(loggedUser.isAdmin === true)
	{
		console.log(loggedUser);
		res.send(products);
	} else
	{
		res.status(403).send('Unauthorized. Action forbidden: Not logged in as Admin.');
	}
});

app.get('/products/:productId', (req, res) =>
{
	console.log(req.params);
	console.log(req.params.productId);
	let productId = parseInt(req.params.productId);
	let item = products[productId]
	res.send(item);
});

app.get('/products/active', (req, res) =>
{
	const activeproducts = products.filter((item) => item.isActive);
	res.send(activeproducts);
});

app.get('/users/:username/orders', (req, res) =>
{
	const { username } = req.params;

	const user = users.find((user) => user.username === username);

	if (!user)
	{
		res.status(404).send('User not found');
		return;
	}

	const orders = user.orders;

	res.send(orders);
	});


app.get('/users/orders', (req, res) =>
{
	if (loggedUser.isAdmin === true)
	{
		const allOrders = users.map((user) => user.orders);

		res.json(allOrders);
	} else
	{
		res.status(403).send('Unauthorized. Action forbidden.');
	}
});

app.post('/users', (req, res) =>
{

	console.log(req.body);
	let newUser =
	{
		email: req.body.email,
		username: req.body.username,
		password: req.body.password,
		isAdmin: req.body.isAdmin
	};
	users.push(newUser);
	console.log(users);

	res.status(200).send('Registered Successfully.')
});

app.post('/users/login', (req, res) =>
{
	console.log(req.body);

	let foundUser = users.find((user) =>
	{
		return user.username === req.body.username && user.password === req.body.password;
	});

	if(foundUser !== undefined)
	{
		let foundUserIndex = users.findIndex((user) =>
		{
			return user.username === foundUser.username
		});
		foundUser.index = foundUserIndex;
		loggedUser = foundUser;
		console.log(loggedUser);

		res.status(200).send('Thank you for logging in.')
	} else
	{
		loggedUser = foundUser;
		res.status(404).send('Login failed. Wrong credentials.')
	}
});

app.post('/products', (req, res) =>
{
	console.log(loggedUser);
	console.log(req.body);

	if (loggedUser.isAdmin === true)
	{
		if (Array.isArray(req.body))
		{
			req.body.forEach((product) =>
			{
				let newProduct =
				{
					name: product.name,
					description: product.description,
					price: product.price,
					isActive: product.isActive,
				};
				products.push(newProduct);
			});

			console.log(products);

			res.status(200).send('You have added new items.');
		} else if (typeof req.body === 'object')
		{
			let newProduct =
			{
				name: req.body.name,
				description: req.body.description,
				price: req.body.price,
				isActive: req.body.isActive,
			};
			products.push(newProduct);

			console.log(products);

			res.status(200).send('You have added a new item.');
		} else
		{
			res.status(400).send('Invalid request body. Expected an array or an object.');
		}
	} else
	{
		res.status(403).send('Unauthorized. Action forbidden.');
	}
});

app.post('/users/orders', (req, res) =>
{
	if (loggedUser)
	{
		const order = req.body;
		loggedUser.orders.push(order);
		res.status(200).send('Order placed successfully.');
	} else
	{
		res.status(403).send('Unauthorized. Action forbidden: Not logged in.');
	}
});


app.put('/users/:username', (req, res) =>
{
	const username = req.params.username;
	const { email, password, isAdmin } = req.body;

	const user = users.find((user) => user.username === username);

	if (!user)
	{
		res.status(404).send('User not found');
		return;
	}

	user.email = email || user.email;
	user.password = password || user.password;
	user.isAdmin = isAdmin || user.isAdmin;

	res.status(200).send('User information updated successfully');
});

app.post('/users/:username/orders', (req, res) =>
{
	const { username } = req.params;
	const { order } = req.body;

	const user = users.find((user) => user.username === username);

	if (!user)
	{
		res.status(404).send('User not found');
		return;
	}

	user.orders.push(order);
	res.send(order);
});

app.put('/products/:productId', (req, res) =>
{
	const productId = parseInt(req.params.productId);

	if(loggedUser.isAdmin === true)
	{
		if (productId >= 0 && productId < products.length)
		{
			products[productId].name = req.body.name;
			products[productId].description = req.body.description;
			products[productId].price = req.body.price;
			products[productId].isActive = req.body.isActive;

			res.status(200).send('Item updated successfully.');
		} else
		{
			res.status(404).send('Item not found.');
		}
	} else
	{
		res.status(403).send('Unauthorized. Action forbidden.');
	}
});

app.put('/products/archive/:productId', (req, res) =>
{
	console.log(req.params);
	console.log(req.params.productId);
	let itemproductId = parseInt(req.params.productId);
	if(loggedUser.isAdmin === true)
	{
		products[itemproductId].isActive = false;
		console.log(products[itemproductId]);
		res.status(200).send('Item Archived.');
	} else
	{
		res.status(403).send('Unauthorized. Action forbidden.');
	}
});

app.put('/products/activate/:productId', (req, res) =>
{
	console.log(req.params);
	console.log(req.params.productId);
	let itemproductId = parseInt(req.params.productId);
	if(loggedUser.isAdmin === true)
	{
		products[itemproductId].isActive = true;
		console.log(products[itemproductId]);
		res.status(200).send('Item Activated.');
	} else
	{
		res.status(403).send('Unauthorized. Action forbidden.');
	}
});

app.put('/users/:username/orders/:orderId', (req, res) =>
{
	const username = req.params.username;
	const orderId = req.params.orderId;
	const update = req.body;

	const user = users.find((user) => user.username === username);

	if (!user)
	{
		res.status(404).send('User not found');
		return;
	}

	const order = user.orders.find((order) => order.id === orderId);

	if (!order)
	{
		res.status(404).send('Order not found');
		return;
	}

	Object.assign(order, update);

	res.status(200).send('Order updated successfully.');
});

app.delete('/products/:productId', (req, res) =>
{
	if (loggedUser.isAdmin)
	{
		const productId = parseInt(req.params.productId);

		if (productId >= 0 && productId < products.length)
		{
			products.splice(productId, 1);
			res.status(200).send('Product deleted successfully.');
		} else
		{
			res.status(404).send('Product not found.');
		}
	} else
	{
		res.status(403).send('Unauthorized. Action forbidden: Not logged in as admin.');
	}
});

app.delete('/users/:username/orders/:orderId', (req, res) =>
{
	const { username, orderId } = req.params;

	const user = users.find((user) => user.username === username);

	if (!user)
	{
		res.status(404).send('User not found');
		return;
	}

	const orderIndex = user.orders.findIndex((order) => order.id === orderId);

	if (orderIndex === -1)
	{
		res.status(404).send('Order not found');
		return;
	}

	user.orders.splice(orderIndex, 1);
	res.send('Order deleted successfully');
});


app.listen(port, () => console.log(`Server is up & running at port ${port}`));