import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface List {
  transactions: Transaction[];
  balance: Balance;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const incomes = await this.find({
      where: { type: 'income' },
    });

    const outcomes = await this.find({
      where: { type: 'outcome' },
    });

    const totalIncome =
      incomes.length > 0
        ? incomes
            .map(item => Number(item.value))
            .reduce((total, next) => total + next)
        : 0;

    const totalOutcome =
      outcomes.length > 0
        ? outcomes
            .map(item => Number(item.value))
            .reduce((total, next) => total + next)
        : 0;

    const balance = {
      income: totalIncome,
      outcome: totalOutcome,
      total: totalIncome - totalOutcome,
    };

    return balance;
  }

  public async getList(): Promise<List> {
    const transactions = await this.find();
    const balance = await this.getBalance();

    const list = {
      transactions,
      balance,
    };

    return list;
  }
}

export default TransactionsRepository;
