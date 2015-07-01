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

- **Wallet**  
  A collection of wallet addresses; a container of credentials (identity, payment,...).

- **Wallet Address**  
  An identifier that represents a possible source or destination of a transaction.

- **Transaction Request**  
  A document that specifies the source, destination, amount and currency of a transaction.

- **Transaction Record**  
  A document that gathers all information required for a transaction request to be included in a transaction chain.

- **Transaction Chain**  
  A sequence of transaction records linked to previous records in a tamper-evident way.

## Constraints

## Modelling

- **Wallet Address**  

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

- **Transaction Request**  

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
