import path from 'path';
import fs from 'fs';
import parse from 'csv-parse/lib/sync';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';
// import AppError from '../errors/AppError';

class ImportTransactionsService {
  async execute(importsFile: string): Promise<Transaction[]> {
    const importsFilePath = path.join(uploadConfig.directory, importsFile);

    const fileBuffer = fs.readFileSync(importsFilePath, {
      encoding: 'utf-8',
    });

    const records = parse(fileBuffer, {
      columns: true,
      trim: true,
      skip_empty_lines: true,
    });

    const transactions: Transaction[] = [];
    const createTransaction = new CreateTransactionService();

    for (let i = 0; i < records.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const transaction = await createTransaction.execute({
        title: records[i].title,
        type: records[i].type,
        value: records[i].value,
        category: records[i].category,
      });
      transactions.push(transaction);
    }

    return transactions;
  }
}

export default ImportTransactionsService;
