const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

require("dotenv").config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
