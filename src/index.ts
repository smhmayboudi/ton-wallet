import {getHttpEndpoint} from '@orbs-network/ton-access';
import {mnemonicToWalletKey} from '@ton/crypto';
import {WalletContractV4, TonClient, fromNano, internal} from '@ton/ton';

async function main() {
  // open wallet v4 (notice the correct wallet version here)
  const mnemonic = 'unfold sugar water ...'; // your 24 secret words (replace ... with the rest of the words)
  const key = await mnemonicToWalletKey(mnemonic.split(' '));
  const wallet = WalletContractV4.create({
    publicKey: key.publicKey,
    workchain: 0,
  });

  // print wallet address
  console.log(wallet.address.toString({testOnly: true}));

  // print wallet workchain
  console.log('workchain:', wallet.address.workChain);

  // initialize ton rpc client on testnet
  const endpoint = await getHttpEndpoint({network: 'testnet'});
  const client = new TonClient({endpoint});

  // query balance from chain
  const balance = await client.getBalance(wallet.address);
  console.log('balance:', fromNano(balance));

  // query seqno from chain
  const walletContract = client.open(wallet);
  const seqno = await walletContract.getSeqno();
  console.log('seqno:', seqno);

  // make sure wallet is deployed
  if (!(await client.isContractDeployed(wallet.address))) {
    return console.log('wallet is not deployed');
  }

  // send 0.05 TON to EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e
  await walletContract.sendTransfer({
    secretKey: key.secretKey,
    seqno: seqno,
    messages: [
      internal({
        to: 'EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e',
        value: '0.05', // 0.05 TON
        body: 'Hello', // optional comment
        bounce: false,
      }),
    ],
  });

  // wait until confirmed
  let currentSeqno = seqno;
  while (currentSeqno === seqno) {
    console.log('waiting for transaction to confirm...');
    await sleep(1500);
    currentSeqno = await walletContract.getSeqno();
  }
  console.log('transaction confirmed!');
}

main();

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
