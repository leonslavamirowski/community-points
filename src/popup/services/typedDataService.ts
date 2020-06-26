export const NULL_METADATA = '0x0000000000000000000000000000000000000000000000000000000000000000';
export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
export const ETH_ADDRESS = '0x0000000000000000000000000000000000000000';
const NULL_INPUT = { blknum: 0, txindex: 0, oindex: 0 };
const NULL_OUTPUT = {
  outputType: 0,
  outputGuard: NULL_ADDRESS,
  currency: NULL_ADDRESS,
  amount: 0
};

const domainSpec = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'verifyingContract', type: 'address' },
  { name: 'salt', type: 'bytes32' }
];

const txSpec = [
  { name: 'txType', type: 'uint256' },
  { name: 'input0', type: 'Input' },
  { name: 'input1', type: 'Input' },
  { name: 'input2', type: 'Input' },
  { name: 'input3', type: 'Input' },
  { name: 'output0', type: 'Output' },
  { name: 'output1', type: 'Output' },
  { name: 'output2', type: 'Output' },
  { name: 'output3', type: 'Output' },
  { name: 'txData', type: 'uint256' },
  { name: 'metadata', type: 'bytes32' }
];

const inputSpec = [
  { name: 'blknum', type: 'uint256' },
  { name: 'txindex', type: 'uint256' },
  { name: 'oindex', type: 'uint256' }
];

const outputSpec = [
  { name: 'outputType', type: 'uint256' },
  { name: 'outputGuard', type: 'bytes20' },
  { name: 'currency', type: 'address' },
  { name: 'amount', type: 'uint256' }
];

const domainData = {
  name: 'OMG Network',
  version: '1',
  verifyingContract: '',
  salt: '0xfad5c7f626d80f9256ef01929f3beb96e058b8b4b0e3fe52d84f054c0e2a7a83'
};

const typedData = {
  types: {
    EIP712Domain: domainSpec,
    Transaction: txSpec,
    Input: inputSpec,
    Output: outputSpec
  },
  domain: domainData,
  primaryType: 'Transaction',
  message: {}
};

export function getTypedData (tx, verifyingContract) {
  domainData.verifyingContract = verifyingContract;

  // Sanitise inputs
  const inputs = tx.inputs.map(i => ({
    blknum: i.blknum,
    txindex: i.txindex,
    oindex: i.oindex
  }));

  // Sanitise Outputs
  const outputs = tx.outputs.map(o => ({
    outputType: o.outputType || 1,
    outputGuard: o.outputGuard || o.owner,
    currency: o.currency,
    amount: o.amount.toString()
  }));

  typedData.message = {
    txType: tx.txType || 1,
    input0: inputs.length > 0 ? inputs[0] : NULL_INPUT,
    input1: inputs.length > 1 ? inputs[1] : NULL_INPUT,
    input2: inputs.length > 2 ? inputs[2] : NULL_INPUT,
    input3: inputs.length > 3 ? inputs[3] : NULL_INPUT,
    output0: outputs.length > 0 ? outputs[0] : NULL_OUTPUT,
    output1: outputs.length > 1 ? outputs[1] : NULL_OUTPUT,
    output2: outputs.length > 2 ? outputs[2] : NULL_OUTPUT,
    output3: outputs.length > 3 ? outputs[3] : NULL_OUTPUT,
    txData: tx.txData || 0,
    metadata: tx.metadata || NULL_METADATA
  };

  return typedData;
}