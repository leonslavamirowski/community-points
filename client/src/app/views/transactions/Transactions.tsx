import * as React from 'react';
import { useState, useEffect } from 'react';
import { unix } from 'moment';
import truncate from 'truncate-middle';
import { useSelector } from 'react-redux';

import * as locationService from 'app/services/locationService';
import { selectTransactions } from 'app/selectors/transactionSelector';
import { selectUserAddressMap, getUsernameFromMap } from 'app/selectors/addressSelector';
import { logAmount } from 'app/util/amountConvert';

import { ITransaction, IUserAddress } from 'interfaces';

import omgcp_thickarrow from 'app/images/omgcp_thickarrow.svg';

import config from 'config';

import * as styles from './Transactions.module.scss';

const TRANSACTIONS_PER_PAGE = 4;

function Transactions (): JSX.Element {
  const [ visibleTransactions, setVisibleTransactions ]: [ ITransaction[], any ] = useState([]);
  const [ visibleCount, setVisibleCount ]: [ number, any ] = useState(TRANSACTIONS_PER_PAGE);

  const allTransactions: ITransaction[] = useSelector(selectTransactions);
  const userAddressMap: IUserAddress[] = useSelector(selectUserAddressMap);

  useEffect(() => {
    if (allTransactions.length) {
      const visibleSet = allTransactions.slice(0, visibleCount);
      setVisibleTransactions(visibleSet);
    }
  }, [ visibleCount, allTransactions ]);

  function handleLoadMore (): void {
    setVisibleCount(visibleCount => visibleCount + TRANSACTIONS_PER_PAGE);
  }

  function handleTransactionClick (hash: string): void {
    locationService.openTab(`${config.blockExplorerUrl}/transaction/${hash}`);
  }

  return (
    <div className={styles.Transactions}>
      {visibleTransactions && !visibleTransactions.length && (
        <div className={styles.disclaimer}>
          No transaction history
        </div>
      )}

      {visibleTransactions && visibleTransactions.map((transaction: ITransaction, index: number): JSX.Element => {
        const isIncoming: boolean = transaction.direction === 'incoming';

        const otherUsername: string = isIncoming
          ? getUsernameFromMap(transaction.sender, userAddressMap)
          : getUsernameFromMap(transaction.recipient, userAddressMap);

        return (
          <div
            key={index}
            className={[
              styles.transaction,
              transaction.status === 'Pending' ? styles.flash : ''
            ].join(' ')}
            onClick={transaction.status === 'Confirmed'
              ? () => handleTransactionClick(transaction.txhash)
              : null
            }
          >
            <img
              src={omgcp_thickarrow}
              className={[
                styles.arrow,
                isIncoming ? styles.incoming : ''
              ].join(' ')}
              alt='arrow'
            />

            <div className={styles.data}>
              <div className={styles.row}>
                <div className={styles.direction}>
                  {isIncoming
                    ? 'Received'
                    : 'Sent'
                  }
                </div>
                <div className={styles.rawAmount}>
                  {`${logAmount(transaction.amount, transaction.decimals)} ${transaction.symbol}`}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.info}>
                  <div
                    className={[
                      styles.status,
                      transaction.status === 'Pending' ? styles.pending : ''
                    ].join(' ')}
                  >
                    {transaction.status === 'Pending' ? 'Pending' : 'Confirmed'}
                  </div>
                  <div className={styles.address}>
                    {isIncoming
                      ? otherUsername || truncate(transaction.sender, 6, 4, '...')
                      : otherUsername || truncate(transaction.recipient, 6, 4, '...')
                    }
                  </div>
                </div>

                <div className={styles.timestamp}>
                  {unix(transaction.timestamp).format('lll')}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {visibleTransactions.length !== allTransactions.length && (
        <div onClick={handleLoadMore} className={styles.more}>
          Load more
        </div>
      )}
    </div>
  );
}

export default React.memo(Transactions);
