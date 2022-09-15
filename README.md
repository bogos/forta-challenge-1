# New Agent Deployment Bot

## Description

This bot detects when a forta agent is deployed by Nethermind address

## Supported Chains

- Polygon

## Alerts

- NM-1
  - Fired when the method `createAgent` is called
  - Severity is always set to "info"
  - Type is always set to "info"
  - Metadata:
    - `metadata`: bot metadata ipfs hash
    - `agentId`: id of the deployed agent
    - `owner`: deployer bot
    - `chainIds`: supported chains

## Test Data

The agent behaviour can be verified with the following transactions:

- [0x8ef79a79f23aca68acf59055229d685d6a5137d6a2eebc9890a3fdeba358c737](https://polygonscan.com/tx/0x8ef79a79f23aca68acf59055229d685d6a5137d6a2eebc9890a3fdeba358c737)
