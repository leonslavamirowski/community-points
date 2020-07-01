import * as React from 'react';
import { useState, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { useDispatch, useSelector, batch } from 'react-redux';

import Address from 'app/components/address/Address';
import Button from 'app/components/button/Button';
import Input from 'app/components/input/Input';
import PointBalance from 'app/components/pointbalance/PointBalance';
import Tabs from 'app/components/tabs/Tabs';

import { ISession } from 'interfaces';
import { transfer, getSession, getTransactions } from 'app/actions';
import { selectLoading } from 'app/selectors/loadingSelector';
import { selectSession } from 'app/selectors/sessionSelector';
import * as omgService from 'app/services/omgService';

import Transactions from 'app/views/transactions/Transactions';
import { powAmount, powAmountAsBN } from 'app/util/amountConvert';
import useInterval from 'app/util/useInterval';
import isAddress from 'app/util/isAddress';

import * as styles from './Home.module.scss';

function Home (): JSX.Element {
  const dispatch = useDispatch();

  const [ view, setView ]: [ 'Transfer' | 'History', any ] = useState('Transfer');
  const [ recipient, setRecipient ]: [ string, any ] = useState('');
  const [ amount, setAmount ]: any = useState('');

  const transferLoading: boolean = useSelector(selectLoading(['TRANSACTION/CREATE']));
  const session: ISession = useSelector(selectSession);

  useEffect(() => {
    omgService.checkHash();
  }, []);

  useInterval(() => {
    batch(() => {
      dispatch(getSession());
      dispatch(getTransactions());
    });
  }, 20 * 1000);

  async function handleTransfer (): Promise<any> {
    try {
      const result = await dispatch(transfer({
        amount: powAmount(amount, session.subReddit.decimals),
        recipient,
        currency: session.subReddit.token,
        symbol: session.subReddit.symbol,
        decimals: session.subReddit.decimals,
        metadata: `${session.subReddit.symbol} community points`
      }));

      if (result) {
        setView('History');
        setAmount('');
        setRecipient('');
      } else {
        // TODO: user ui feedback that transfer failed
      }
    } catch (error) {
      //
    }
  }

  function disableTransfer (): boolean {
    if (!session || !recipient || !amount) {
      return true;
    };
    // no invalid addresses
    if (!isAddress(recipient)) {
      return true;
    };
    // no merge transactions
    if (recipient.toLowerCase() === session.account.toLowerCase()) {
      return true;
    }
    // positive amount
    if (amount <= 0) {
      return true;
    }
    // no amounts greater than point balance
    if (powAmountAsBN(amount, session.subReddit.decimals).gt(new BigNumber(session.balance))) {
      return true;
    }
    return false;
  }

  if (!session) {
    return (
      <div>Loading...</div>
    );
  }

  return (
    <div className={styles.Home}>
      <h1>{`r/${session.subReddit.name}`}</h1>
      <Address
        address={session.account}
        className={styles.address}
      />
      <PointBalance
        amount={session.balance}
        symbol={session.subReddit.symbol}
        decimals={session.subReddit.decimals}
        className={styles.pointbalance}
      />

      <Tabs
        options={[ 'Transfer', 'History' ]}
        selected={view}
        onSelect={setView}
      />

      {(view as any) === 'Transfer' && (
        <>
          <Input
            type='number'
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder='Amount'
            className={styles.input}
            suffix={session.subReddit.symbol}
          />
          <Input
            type='text'
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            placeholder='Recipient'
            className={styles.input}
          />
          <Button
            onClick={handleTransfer}
            className={styles.transferButton}
            disabled={disableTransfer()}
            loading={transferLoading}
          >
            <span>TRANSFER</span>
          </Button>
        </>
      )}

      {(view as any) === 'History' && <Transactions />}
    </div>
  );
}

export default React.memo(Home);
