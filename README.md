# WebWallet API
### A digital wallet specification for the Web.

## Abstract
This specification defines a RESTful API for the creation of digital wallets, issuance of virtual currencies and processing of transactions on the Web. The API is built around the concept of money as information about debts in the form of IOUs, and the use of cryptographically-signed messages to represent those IOUs.

## Contents
- Definitions
- Design Principles
- Constraints
- Data Modeling
- API Overview

## Definitions
  - **WebWallet**  
  A WebWallet is a URL that references and enables interactions with a wallet address. WebWallet URLs use the following syntax:  

  ```
  https://wallet.example.com/address/{wallet-address}
  ```

  - **Wallet Address**  
  An identifier used to keep an account of currency units. Wallet addresses are to be found in the {wallet-address} segment of WebWallet URLs, and are generated by base58check-encoding a prefixed 20-bytes hash of a public key:

  ```
  wUhBhfiaDxpYwdE754TU8XH49ayDjqM3bR      [base58check('87' + hash20bytes(publicKey))]
  ```
  - **Transaction**  
  An operation that atomically modifies the balance of two or more addresses in a proportional way, so that the amount added to the recipient addresses equals the amount subtracted from the sender addresses.

  - **Transaction Input**  
  A message that specifies the source, destination, amount and currency of a transaction. It is a statement about the future that will be fulfilled when it is processed as part of a transaction request. This message must be cryptographically signed by the listed addresses as a proof of consent to participate in the transaction.

  - **Transaction Output**  
  A message that specifies an aggregate change of an address balance after processing one or more transaction inputs. It is a statement about the past that fulfills the promises made by the inputs. This message is a reference to a document that reflects the resulting balance of an address after processing a transaction.

  - **Transaction Request**  
  A message that groups all the information required for a transaction to be processed and included in a transaction chain, such as the instructions for transfering currency units between the involved addresses (inputs) and the resulting balance changes in each of the addresses (outputs).

  - **Transaction Record**  
  A transaction request that was processed and included in a transaction chain along with one or more cryptographic signatures that confirm the transaction as valid.

  - **Transaction Chain**  
  A sequence of transaction records where each record is linked to the previous one by including a cryptographically secure reference to it.

  
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
  The WebWallet API uses the JavaScript Object Notation (JSON) format to represent transaction requests and records, and the JavaScript Object Signing and Encryption (JOSE) specifications to add security to those records. Specifically, JSON Web Signatures (JWS) and public key cryptography are used to digitally sign and verify the integrity and authenticity of JSON messages.
    - **JSON Web Signatures**  
    All data is structured using an extended version of the unencoded General JWS JSON Serialization syntax. The actual data is stored in the "payload" property as a JSON object, while the cryptographic signatures that secure the data are listed in the "signatures" array. An additional property "hash" contains the cryptograhic hash of the "payload" that is passed as the message parameter of digital signature algorithms.
    ``` json
  {
        "hash": {
          
        },
        "payload": {
          
        },
        "signatures": [
          
        ]
  }
    ```
      
    - **Public Key Cryptography**  
    With the purpose of enabling client-side address generation and [multisignature] transaction signing, decentralized verification of transaction requests, and public auditability of transaction records, all digital signatures are generated using public key cryptography and bundled with the signing key and algorithm ("header") used to generate each "signature".
    ``` json
  {
        "hash": {
        
        },
        "payload": {
          
        },
        "signatures": [
          {
            "header": {
              "alg": "public key signature algorithm",
              "kid": "public key reference"
            },
            "signature": "publicly verifiable signature"
          }
        ]
  }
  ```
      
    - **Transaction Chains**  
    In order to protect transaction history from tampering, each transaction record includes a reference to the previous transaction (a cryptographic hash of the previous payload), thus creating a cryptographically secured chain of records whose order and contents cannot be altered without breaking the chain and leaving a trace.
    ``` json
  {
        "hash": {
          "type": "cryptographic hash function",
          "value": "current transaction hash"
        },
        "payload": {
          "previous": "previous transaction hash"
        },
        "signatures": [
        
        ]
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
      "entities": [],
      "actions": [],
      "links": []
    }
    ```

## Data Modeling

### Transaction Requests

- **General Structure**  

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

## Glossary
   - **Money**  
     Information about transferable debts.
   - **Debt**  
     An obligation to complete a partial exchange.
   - **IOU (I Owe You)**  
     A signed document that aknowledges a debt.
   - **Currency**  
     An abstract unit of account in which debts are denominated.
   - **Currency Unit**  
     An arbitrary increment on an abstract scale of measurement.
   - **Currency System**  
     A system that follows a set of rules to keep accounts of currency units.
   - **Currency Supply**  
     The amount of existing currency units at a particular point in time.
   - **Clearing**  
     Modification of account balances as a result of processing IOUs.
   - **Settlement**  
     An actual payment that offsets an outstanding debt after clearing.
