const express = require('express');
const cookieParser=require("cookie-parser");

const { Mkbug } = require('./../index');

new Mkbug(express(), {
  path: './example'
})
.create('/api')
.use('/error', (req, res, next) => {
  next(new Error('test error'))
})
.use('/heath', (req, res) => {
  res.status(200).end()
})
.use(cookieParser())
.use('/cookie', (req, res) => {
  res.cookie('cookie_test', 'mkbug-cookie');
  res.end();
})
.use('/close', (req, res) => {
  res.status(200).end('server down!')
  process.exit(0);
})
.use((req, res) => {
  res.status(404).end('Server has exception!')
})
.use((err, req, res) => {
  if (err) {
    res.status(500).end('Server has exception!')
  }
})
.start(3000);
