import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (type === 'outcome') {
      const balance = await transactionsRepository.getBalance();

      if (balance.total < value) {
        throw new AppError("Transaction value can't be greater than balance");
      }
    }

    let theCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!theCategory) {
      theCategory = await categoriesRepository.create({
        title: category,
      });
    }

    await categoriesRepository.save(theCategory);

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: theCategory.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
