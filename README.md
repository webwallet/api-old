# WebWallet API
### A digital wallet specification for the Web.

## Abstract
This specification defines a RESTful API for the creation of digital wallets, issuance of virtual currencies and processing of transactions on the Web.

## Contents
- Introduction
- Definitions
- Constraints
- Modelling
- API Reference

## Introduction

## Definitions

## Constraints

## Modelling

- Wallet Address  

  ``` json
  {
    "address": "",
    "balance": 0,
    "currency": "",
    "limits": {
      "lower": 0,
      "upper": null
    }
  }
  ```

- Transaction Request

  ``` json
  {
    "header": {
      "alg": ""
    },
    "payload": {
      "sub": "",
      "aud": "",
      "amt": 0,
      "iou": "",
      "iat": ""
    },
    "signature": ""
  }
  ```

## API Reference
