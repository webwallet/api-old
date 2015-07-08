# WebWallet API
### A digital wallet specification for the Web.

## Abstract
This specification defines a RESTful API for the creation of digital wallets, issuance of virtual currencies and processing of transactions on the Web.

## Contents
- Introduction
- Design Principles
- Definitions
- Constraints
- Data Modeling
- API Reference

## Introduction
  Money is a social technology that arose from debt (not from barter), and therefore it is just information about what we owe each other. With modern technology, this information can be generated with a computer or mobile phone and sent over the Internet like any instant message or email. The WebWallet API is a proposal for the creation, communication and processing of such information on the Web.

### Motivation
  The Web is made of links, but money isn't. If links are so powerful, there should be links referencing and enabling interactions with money, just like there are links to other types of information such as articles, photos and videos. The WebWallet API is built around the concept of modeling digital wallets and their contents as URLs, and the transactions between them as requests to those URLs.

### Basic Concepts
  - **WebWallet**  
  A WebWallet is a URL that references and enables the interaction with a set of payment credentials. A payment credential is any means or proof of payment such as virtual currencies, receipts, tickets, coupons, gift cards, loyalty points, certificates or badges. WebWallet URLs use the following syntax:  

  ```
  https://wallet.example.com/address/{address}
  ```
  
  where {address} is an identifier that references a particular payment credential, which may or may not belong to a collection of credentials enclosed by another WebWallet.
  
## Design Principles
 This specification is based on a unified monetary and transactional model that enables the implementation of different currency systems in a uniform way, a tamper-evident approach for ensuring data integrity and protecting transaction history, and a RESTful API that exposes all resources and interactions according to the architectural style of the Web.
 
 - **Monetary and Transactional Model**  
  The WebWallet API uses the same underlying data modeling and transaction processing rules for implementing different currency systems, which result from different configurations of the following parameters:
    - **Balance Limits**  
      Besides a balance attribute, every address has a lower and an upper balance limit. The configuration of these limits enables the implementation of several currency systems such as centrally-issued currencies (all but one addresses have a lower limit greater than or equal to zero), cash-in currency systems (only the gateway addresses have negative lower limits) and mutual credit systems (all addresses have negative lower limits).
    - **Transaction Source**  
      The funds for a transaction sent to an address always come from another address. Given that all addresses start with a balance of zero, every currency system must have at least one address with a negative lower limit, so that a currency supply can be created and eventually used by the remaining addresses to carry out transactions between them.
    - **Currency Supply**  
      The currency supply is created, increased or decreased by sending transactions from/to addresses with negative lower limits. It can be a fixed amount issued upfront (limited assets), a growing amount increased on-demand (centrally-issued currencies), a dynamic amount changed on-demand (mutual credit systems), or any combination thereof.

 - **Data Integrity Approach**  
    - **JSON Web Signatures**  

    - **Public Key Cryptography**  

    - **Transaction Chains**  


 - **RESTful API**  
 The WebWallet API aims to be fully REST compliant, meaning level 3 in the Richardson Maturity Model. This implies having a URL for each resource, interacting with them using a standard set of verbs, and enabling discoverability and state transitions through hypermedia.
    - **Resource URLs**  

    - **HTTP Verbs**  

    - **Hypermedia Controls**  
  

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
   - **Balance type**  
     Address balances must be represented in numbers, not strings.
   - **Balance initialization**  
     New addresses must always be created with a balance of zero.
   - **Balance modification**  
     Address balances can only be modified by valid transactions.
   - **Balance value**  
     Address balances must always be in the range defined by their balance limits.
   - **Balance limits**  
     Upper limits must always be greater than or equal to their corresponding lower limits.
   - **Balance format**  
     Address balances can only have decimal place values if allowed by the currency.

## Data Modeling

### Database Records

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

### Request Messages

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

### Transaction Types

  - **P2P (Peer-to-Peer)**  

  ``` json
  "sub": "sourceAddress"
  "aud": "destinationAddress"
  ```
  
  - **P2N (Peer-to-Network)**  

  ``` json
  "sub": "sourceAddress"
  "aud": "*"
  ```
  
  - **N2N (Network-to-Network)**  

  ``` json
  "sub": "clearingAddress"
  "aud": "*"
  ```
  
## API Reference

  - **/address**  

  - **/balance**  

  - **/transactions**  
