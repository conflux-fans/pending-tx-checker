import './App.css';
import { useState } from 'react';
import { 
  Button, 
  Row, 
  Col, 
  Form,
  Input,
  Card,
  Typography,
} from 'antd';
import { CheckCircleTwoTone } from '@ant-design/icons';
import { Conflux, address, Drip } from 'js-conflux-sdk';
const { Text } = Typography;

const mainnetClient = new Conflux({
  url: "https://main.confluxrpc.com",
  networkId: 1029
});

const testnetClient = new Conflux({
  url: "https://test.confluxrpc.com",
  networkId: 1
});

function pendingStatus(status) {
  if(status.pending) {
    if (status.pending === 'futureNonce') {
      return 'FutureNonce';
    } else if (status.pending === 'notEnoughCash') {
      return 'NotEnoughCash';
    }
  } else if (status === 'packed') {
    return 'Packed';
  } else if (status === 'ready') {
    return 'Ready';
  }
}

function hashLink(account, hash) {
  const isTestNetAccount = account.startsWith('cfxtest') || account.startsWith('CFXTEST');
  const link = isTestNetAccount ? `https://testnet.confluxscan.io/transaction/${hash}` : `https://confluxscan.io/transaction/${hash}`;
  return <a href={link} target='_blank'>{hash.slice(0, 10)}......{hash.slice(hash.length-10, hash.length)}</a>
}

function App() {
  const [account, setAccount] = useState('');
  const [checked, setChecked] = useState(false);
  const [nonce, setNonce] = useState('0');
  const [balance, setBalance] = useState('0');
  const [pendingInfo, setPendingInfo] = useState({
    pendingCount: 0,
    pendingTransactions: [],
    firstTxStatus: null,
  });

  const checkPendingTx = async () => {
    if (!account || !address.isValidCfxAddress(account)) {
      alert('Please input a valid base32 address');
      return;
    }
    
    const isTestNetAccount = account.startsWith('cfxtest') || account.startsWith('CFXTEST');
    const client = isTestNetAccount ? testnetClient : mainnetClient;
    const _pendingInfo = await client.cfx.getAccountPendingTransactions(account);
    setChecked(true);
    setPendingInfo(_pendingInfo);

    const nonce = await client.cfx.getNextNonce(account);
    setNonce(nonce.toString());

    const balance = await client.cfx.getBalance(account);
    setBalance(Drip(balance).toCFX());
  }

  let checkResult;
  if (checked) {
    if (pendingInfo.firstTxStatus) {
      checkResult = (
        <Row justify='center' className='mt-10'>
          <Col span={8}>
            <Card>
              <p>Account Current Nonce: <Text type='success' strong>{nonce}</Text></p>
              <p>Account Current Balance: <Text type='success' strong>{balance} CFX</Text></p>
              <p>Pending TX Count: <Text type='danger' strong>{pendingInfo.pendingCount.toString()}</Text></p>
              <p>First Pending TX Status: <Text type='danger' strong>{pendingStatus(pendingInfo.firstTxStatus)}</Text></p>
              <p>First Pending TX Nonce: <Text type='danger' strong>{pendingInfo.pendingTransactions[0].nonce}</Text></p>
              <p>First Pending TX Hash: {hashLink(account, pendingInfo.pendingTransactions[0].hash)}</p>
              <p>Possible Solution: {pendingStatus(pendingInfo.firstTxStatus) === 'FutureNonce' ? 'Use the correct nonce send tx' : 'Get enough balance'}</p>
            </Card>
          </Col>
        </Row>
      );
    } else {
      checkResult = (
        <Row justify='center' className='mt-10'>
          <Col span={8}>
            <Card>
              <div style={{textAlign: 'center'}}>
                <CheckCircleTwoTone twoToneColor="#52c41a" style={{fontSize: '50px'}} />
                <p className='mt-10'>Congratulations this account have no pending transactions</p>
              </div>
            </Card>
          </Col>
        </Row>
      );
    }
  }

  return (
    <div className="App">
      <Row className='mt-100' justify='center' style={{textAlign: 'center'}}>
        <Col span={8}>
          <h1>Conflux Pending TX Checker</h1>
        </Col>
      </Row>
      <Row justify='center' className='mt-10'>
        <Col span={8}>
          <Form layout='inline'>
            <Form.Item style={{width: '80%'}} >
              <Input 
                size='large' 
                placeholder="Input your Conflux address"
                onChange={e => setAccount(e.target.value)}
              />
            </Form.Item>
            <Form.Item>
              <Button size='large' type="primary" onClick={checkPendingTx} style={{width: "100%"}}>Check</Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
      { checkResult }
      <Row className='mt-10' justify='center'>
        <Col span={8}>
          <Card>
            <h3>Possible Pending Reasons:</h3>
            <ul>
              <li>1. NotEnoughCash: Sender account do not have enough CFX for the transaction</li>
              <li>2. FutureNonce: Use a skipped nonce</li>
              <li>3. Ready: Ready for miner to pack</li>
            </ul>
            <h3>Documentation about Conflux Transaction:</h3>
            <ul>
              <li>1. <a href='https://developer.confluxnetwork.org/sending-tx/en/transaction_explain'>Transaction complete explanation</a></li>
              <li>2. <a href='https://developer.confluxnetwork.org/sending-tx/en/transaction_stage'>Transaction Stages explain</a></li>
              <li>3. <a href="https://developer.confluxnetwork.org/sending-tx/en/why_tx_is_pending">Why Transaction is Pending</a></li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default App;
