import Transaction from "../models/Transaction.js";
import PDFDocument from "pdfkit";

class TransactionController {
  constructor() {
    this.transactionModel = new Transaction();
  }

  // Get user's transaction history
  async getTransactionHistory(req, res) {
    try {
      const userId = req.session?.user?.userId;
      const { limit = 50, offset = 0 } = req.query;

      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const transactions = await this.transactionModel.getUserTransactions(
        userId, 
        parseInt(limit), 
        parseInt(offset)
      );

      res.status(200).json(transactions);
    } catch (error) {
      console.error("Get transaction history error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get transactions by type (buy/sell)
  async getTransactionsByType(req, res) {
    try {
      const { type } = req.params;
      const userId = req.session?.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      if (!["buy", "sell"].includes(type)) {
        return res.status(400).json({ error: "Invalid transaction type. Must be 'buy' or 'sell'" });
      }

      const transactions = await this.transactionModel.getTransactionsByType(userId, type);

      res.status(200).json(transactions);
    } catch (error) {
      console.error("Get transactions by type error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get realized profit/loss
  async getRealizedProfitLoss(req, res) {
    try {
      const userId = req.session?.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profitLossData = await this.transactionModel.calculateRealizedProfitLoss(userId);

      // Calculate totals
      const summary = profitLossData.reduce((acc, item) => {
        acc.total_invested += parseFloat(item.total_buy_amount) || 0;
        acc.total_returns += parseFloat(item.total_sell_amount) || 0;
        acc.total_realized_pnl += parseFloat(item.realized_pnl) || 0;
        return acc;
      }, { total_invested: 0, total_returns: 0, total_realized_pnl: 0 });

      res.status(200).json({
        summary,
        details: profitLossData
      });
    } catch (error) {
      console.error("Get realized profit/loss error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get profit/loss for a specific company
  async getCompanyProfitLoss(req, res) {
    try {
      const { companyId } = req.params;
      const userId = req.session?.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profitLossData = await this.transactionModel.getCompanyProfitLoss(userId, companyId);

      if (!profitLossData) {
        return res.status(404).json({ error: "No transactions found for this company" });
      }

      res.status(200).json(profitLossData);
    } catch (error) {
      console.error("Get company profit/loss error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get transaction summary
  async getTransactionSummary(req, res) {
    try {
      const userId = req.session?.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const summary = await this.transactionModel.getTransactionSummary(userId);

      // Calculate additional metrics
      const totalPnL = parseFloat(summary.total_returns) - parseFloat(summary.total_invested);
      const pnlPercentage = summary.total_invested > 0 
        ? (totalPnL / parseFloat(summary.total_invested)) * 100 
        : 0;

      res.status(200).json({
        ...summary,
        total_pnl: totalPnL,
        pnl_percentage: pnlPercentage
      });
    } catch (error) {
      console.error("Get transaction summary error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Generate PDF report
  async generateReport(req, res) {
    try {
      const userId = req.session?.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Get transaction data and current holdings
      const [transactions, holdings] = await Promise.all([
        this.transactionModel.getUserTransactions(userId, 100, 0),
        this.transactionModel.getUserCurrentHoldings(userId)
      ]);

      // Create PDF document
      const doc = new PDFDocument();
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=stock_report.pdf');
      
      // Pipe the PDF to the response
      doc.pipe(res);

      // Add content to PDF
      doc.fontSize(20).text('Stock Trading Report', { align: 'center' });
      doc.moveDown();
      
      // Add transaction table
      doc.fontSize(16).text('Transaction History');
      doc.moveDown();
      
      // Define table layout
      const tableTop = 150;
      let tableRow = tableTop;
      
      // Add table headers
      doc.fontSize(12);
      doc.text('Type', 50, tableRow);
      doc.text('Company', 150, tableRow);
      doc.text('Quantity', 250, tableRow);
      doc.text('Amount', 350, tableRow);
      doc.text('Date', 450, tableRow);
      
      tableRow += 20;

      // Add transaction rows
      transactions.forEach(tx => {
        const color = tx.transaction_type === 'buy' ? '#0000FF' : '#FF0000';
        const displayType = tx.transaction_type === 'buy' ? 'Buy' : 'Sell';

        doc.fillColor(color).text(displayType, 50, tableRow);
        doc.fillColor('black').text(tx.company_name || '-', 150, tableRow);
        doc.text(tx.quantity?.toString() || '-', 250, tableRow);
        doc.text(`$${tx.total_amount}`, 350, tableRow);
        doc.text(new Date(tx.transaction_date).toLocaleDateString(), 450, tableRow);
        
        tableRow += 20;
        
        // Add new page if needed
        if (tableRow > 700) {
          doc.addPage();
          tableRow = 50;
        }
      });

      // Add current holdings if available
      if (holdings && holdings.length > 0) {
        doc.addPage();
        doc.fontSize(16).text('Current Holdings');
        doc.moveDown();
        
        holdings.forEach(stock => {
          doc.fontSize(12).text(
            `${stock.company_name}: ${stock.quantity} shares at average price $${stock.average_price}`
          );
          doc.moveDown();
        });
      }

      // Finalize PDF
      doc.end();

    } catch (error) {
      console.error("Generate report error:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  }
}

export default TransactionController;