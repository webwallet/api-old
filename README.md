# WebWallet API
### A digital wallet specification for the Web.

## Abstract
This specification defines a RESTful API for the creation of digital wallets, issuance of virtual currencies and processing of transactions on the Web. The API is built around the concept of modeling digital wallets and their contents as URLs, and the transactions between them as requests to those URLs.

## Contents
- Introduction
- Design Principles
- Definitions
- Constraints
- Data Modeling
- API Overview

## Introduction
  The Web is made of links, but money isn't, yet. If links are so useful for referencing different kinds of information such as articles, photos and videos, why aren't they used to reference and enable interactions with money? 
  
  Money is a social technology that arose from debt (not from barter), and therefore it is just information about what we owe each other. Using public key cryptography and Web technologies, this information can be generated with a computer, referenced using URLs and sent over the Internet like any instant message or email. The WebWallet API is a proposal for the creation, communication and processing of such information on the Web.

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
  The WebWallet API uses the JavaScript Object Notation (JSON) format to represent transaction requests and records, and the JavaScript Object Signing and Encryption (JOSE) specifications to add security to JSON. Specifically, JSON Web Signatures (JWS) and public key cryptography are used to digitally sign and verify the integrity and authenticity of JSON messages.
    - **JSON Web Signatures**  
    All transaction messages and database records are structured using the unencoded JWS JSON Serialization syntax, where "payload" contains the actual data as a JSON object, "header" contains information about the signing key and algorithm, and "signature" contains a JWS signature.
    ``` json
  {
        "header": {
          "alg": "cryptographic algorithm"
        },
        "payload": {
          
        },
        "signature": "cryptographic signature"
  }
    ```
      
    - **Public Key Cryptography**  
    With the purpose of enabling client-side address generation and transaction signing, decentralized verification of transaction requests, and public auditability of transaction records, all JWS signatures are generated using public key cryptography.
    ``` json
  {
        "header": {
          "alg": "public key signature algorithm"
        },
        "payload": {
          
        },
        "signature": "publicly verifiable signature"
  }
    ```
      
    - **Transaction Chains**  
    In order to protect transaction history from tampering, each transaction record includes a reference to the previous transaction, thus creating a cryptographically secured chain of records whose order cannot be altered without leaving a trace. This reference can be the merkle root of all the signatures that secure the previous transaction record.
    ```
    "payload": {
      "previous": "transactionReference"
    }
    ```

 - **RESTful API**  
 The WebWallet API aims to be fully REST compliant, meaning level 3 in the Richardson Maturity Model. This implies having a URL for each resource, interacting with them using a standard set of verbs, and enabling discoverability and state transitions through hypermedia.
    - **Resource URLs**  
    Each resource or collection is exposed by the API with a URL that uniquely identifies it. However, some resources are intrinsically related to more than one entity (e.g. transactions) or need to be mappable from different identifiers; therefore, multiple URLs can reference the same resource. In general, resource URLs use one of the following syntaxes:

    ``` 
    https://wallet.example.com/resourceType/{resourceID}
    https://wallet.example.com/resourceType/{resourceID}/resourceProperty/{propertyID}
    ```  
    
    - **HTTP Verbs**  
    All interactions with the resources exposed by the API are specified with a combination of a noun and a verb, where the nouns are indicated by resource URLs, and the verbs are indicated by HTTP methods. No verbs are to be found is any URL scheme, and no verbs are to be used besides the standard set defined by HTTP:
    ``` 
    GET     POST      PUT     DELETE
    ```  
    
    - **Hypermedia Controls**  
    All API responses contain hyperlinks that can be used to navigate or drive the application state. These links are grouped into three categories based on the [SIREN](https://github.com/kevinswiber/siren) specification: "entities" are references to related sub-entities, "actions" are references to behaviour an entity exposes, and "links" are references to navigational transitions:
    ``` json
    {
      "properties": {
        
      },
      "entities": [
        { "rel": ["sub-entity"], "href": "entity-url" }
      ],
      "actions": [
        { "name": "action-name", "method": "http-verb", "href": "entity-url" }
      ],
      "links": [
        { "rel": ["some-entity"], "href": "entity-url" }
      ]
    }
    ```
  

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

### API Requests

- **Transaction Request**  

  ``` json
  {
    "header": {
      "alg": "",
      "kid": ""
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
  
  
#### Transaction Types

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

- **Transaction Request**  

  ``` json
  {
    "payload": {
      "sub": "",
      "aud": "",
      "amt": 0,
      "iou": "",
      "iat": ""
    },
    "signatures": [
      {
        "header": {
          "alg": "",
          "kid": ""
        },
        "signature": ""
      }
    ]
  }
  ```

### API Responses  

- **General structure**  

  ``` json
  {
    "properties": {},
    "entities": [],
    "actions": [],
    "links": []
  }
  ```
  
## API Overview
The WebWallet API defines three basic endpoints: one for generating wallet addresses (/address), one for issuing currencies (/currency) and one for sending transaction requests (/transactions).
  - **/address**  
    Wallet addresses can be generated by sending a POST request to the /address endpoint:
    ```
    POST /address HTTP/1.1
    Host: wallet.example.com
    Authorization: Bearer <TOKEN>
    ```

  - **/currency**   
    New currencies can be issued by sending a POST request to the /currency endpoint:
    ```
    POST /currency HTTP/1.1
    Host: wallet.example.com
    Authorization: Bearer <TOKEN>
    ```

  - **/transactions**  
    Transaction requests can be made by sending a POST request to the /transactions endpoint of a wallet address:
    ```
    POST /address/.../transactions HTTP/1.1
    Host: wallet.example.com
    Authorization: Bearer <TOKEN>
    ```
