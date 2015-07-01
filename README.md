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
  Money arose from debt, not from barter, and therefore it is information about what we owe each other. With modern technology, this information can be generated with a computer and sent over the Internet like any instant message or email, but we need to agree on how this information will be created and communicated securely. The WebWallet API is a proposal for the creation and processing of such information on the Web.

### Design Principles
 This specification defines a unified monetary and transactional model that enables the implementation of different currency systems in a uniform way, a tamper-evident approach for ensuring data integrity and protecting transaction history, and a RESTful API that exposes all resources and functionality according to the architectural style of the Web.
 
 - Monetary and Transactional Model
 
 - Data Integrity Approach

 - RESTful API
 
## Definitions

- **Wallet**  
  A collection of wallet addresses; a container of credentials (identity, payment,...).

- **Wallet Address**  
  An identifier that represents a possible source or destination of a transaction.

- **Transaction Request**  
  A message that specifies the source, destination, amount and currency of a transaction.

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
