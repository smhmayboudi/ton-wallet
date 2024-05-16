import {mnemonicToKeyPair} from 'tonweb-mnemonic';
import TonWeb from 'tonweb';

async function main() {
  const mnemonic = 'unfold sugar water ...'; // your 24 secret words (replace ... with the rest of the words)
  const key = await mnemonicToKeyPair(mnemonic.split(' '));

  // open wallet v4 (notice the correct wallet version here)
  const tonweb = new TonWeb();
  const WalletClass = tonweb.wallet.all['v4R2'];
  const wallet = new WalletClass(undefined!, {publicKey: key.publicKey});

  // print wallet address
  const walletAddress = await wallet.getAddress();
  console.log(walletAddress.toString(true, true, true, true)); // last true required for testnet

  // print wallet workchain
  console.log('workchain:', walletAddress.wc);

  // query balance from chain
  const balance = await tonweb.getBalance(walletAddress);
  console.log('balance:', TonWeb.utils.fromNano(balance));

  // query seqno from chain
  const seqno = (await wallet.methods.seqno().call()) || 0;
  console.log('seqno:', seqno);

  // send 0.05 TON to EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e
  await wallet.methods
    .transfer({
      secretKey: key.secretKey,
      toAddress: 'EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e',
      amount: TonWeb.utils.toNano('0.05'), // 0.05 TON
      seqno: seqno,
      payload: 'Hello', // optional comment
      sendMode: 3,
    })
    .send();

  // wait until confirmed
  let currentSeqno = seqno;
  while (currentSeqno === seqno) {
    console.log('waiting for transaction to confirm...');
    await sleep(1500);
    currentSeqno = (await wallet.methods.seqno().call()) || 0;
  }
  console.log('transaction confirmed!');
}

main();

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
