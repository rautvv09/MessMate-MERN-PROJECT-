const PDFDocument = require('pdfkit');

/**
 * Generates a professional PDF invoice for a bill.
 * Returns a Buffer containing the PDF data.
 *
 * @param {Object} bill      - The populated bill document
 * @param {Object} student   - { name, email, phone }
 * @param {Object} mess      - { name, address, city }
 * @returns {Promise<Buffer>} - PDF file buffer
 */
const generateBillPDF = (bill, student, mess) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Invoice ${bill.billNumber}`,
          Author: 'MessMate',
          Subject: `Monthly Bill - ${bill.billingPeriod.year}/${bill.billingPeriod.month}`,
        },
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const pageWidth = doc.page.width - 100; // 50 margin each side

      // ==================== HEADER ====================
      doc
        .fontSize(24)
        .fillColor('#10b981')
        .text('MessMate', 50, 50)
        .fontSize(10)
        .fillColor('#6b7280')
        .text('Student Attendance & Billing System', 50, 78);

      // Invoice title
      doc
        .fontSize(18)
        .fillColor('#111827')
        .text('INVOICE', 400, 50, { align: 'right' })
        .fontSize(10)
        .fillColor('#6b7280')
        .text(bill.billNumber, 400, 74, { align: 'right' });

      doc.moveTo(50, 100).lineTo(545, 100).strokeColor('#e5e7eb').stroke();

      // ==================== BILL INFO ====================
      let y = 115;

      // Left column: Mess details
      doc
        .fontSize(10)
        .fillColor('#6b7280')
        .text('FROM', 50, y)
        .fontSize(11)
        .fillColor('#111827')
        .text(mess.name, 50, y + 15)
        .fontSize(9)
        .fillColor('#6b7280')
        .text(mess.address || '', 50, y + 30)
        .text(mess.city || '', 50, y + 43);

      // Right column: Student details
      doc
        .fontSize(10)
        .fillColor('#6b7280')
        .text('BILL TO', 350, y, { align: 'right' })
        .fontSize(11)
        .fillColor('#111827')
        .text(student.name, 350, y + 15, { align: 'right' })
        .fontSize(9)
        .fillColor('#6b7280')
        .text(student.email, 350, y + 30, { align: 'right' })
        .text(student.phone || '', 350, y + 43, { align: 'right' });

      y += 70;

      // Billing period and dates row
      doc.moveTo(50, y).lineTo(545, y).strokeColor('#e5e7eb').stroke();
      y += 12;

      const monthNames = [
        '', 'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      const periodStr = `${monthNames[bill.billingPeriod.month]} ${bill.billingPeriod.year}`;
      const dueDateStr = new Date(bill.dueDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const generatedStr = new Date(bill.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      doc
        .fontSize(9)
        .fillColor('#6b7280')
        .text(`Billing Period: ${periodStr}`, 50, y)
        .text(`Plan: ${bill.planType}`, 200, y)
        .text(`Generated: ${generatedStr}`, 350, y)
        .text(`Due Date: ${dueDateStr}`, 450, y);

      y += 25;

      // ==================== MEAL CONSUMPTION TABLE ====================
      doc
        .fontSize(12)
        .fillColor('#111827')
        .text('Meal Consumption', 50, y);

      y += 20;

      // Table header
      doc
        .rect(50, y, pageWidth, 22)
        .fillColor('#f9fafb')
        .fill();

      doc
        .fontSize(9)
        .fillColor('#6b7280')
        .text('MEAL', 60, y + 6)
        .text('COUNT', 220, y + 6)
        .text('PRICE (₹)', 320, y + 6)
        .text('TOTAL (₹)', 440, y + 6, { align: 'right' });

      y += 22;

      // Table rows
      const mealRows = [
        {
          name: 'Breakfast',
          count: bill.mealCounts.breakfastCount,
          price: bill.priceSnapshot.breakfastPrice,
          total: bill.breakfastTotal,
        },
        {
          name: 'Lunch',
          count: bill.mealCounts.lunchCount,
          price: bill.priceSnapshot.lunchPrice,
          total: bill.lunchTotal,
        },
        {
          name: 'Dinner',
          count: bill.mealCounts.dinnerCount,
          price: bill.priceSnapshot.dinnerPrice,
          total: bill.dinnerTotal,
        },
      ];

      mealRows.forEach((row) => {
        doc.moveTo(50, y).lineTo(545, y).strokeColor('#f3f4f6').stroke();

        doc
          .fontSize(10)
          .fillColor('#374151')
          .text(row.name, 60, y + 6)
          .text(String(row.count), 220, y + 6)
          .text(`₹${row.price.toFixed(2)}`, 320, y + 6)
          .fillColor('#111827')
          .text(`₹${row.total.toFixed(2)}`, 440, y + 6, { align: 'right' });

        y += 24;
      });

      doc.moveTo(50, y).lineTo(545, y).strokeColor('#e5e7eb').stroke();

      y += 10;

      // ==================== TOTALS SECTION ====================
      const addTotalRow = (label, value, bold = false, color = '#374151') => {
        doc
          .fontSize(bold ? 11 : 10)
          .fillColor('#6b7280')
          .text(label, 320, y)
          .fillColor(color)
          .text(`₹${value.toFixed(2)}`, 440, y, { align: 'right' });
        y += 20;
      };

      addTotalRow('Meal Subtotal', bill.mealSubtotal);

      if (bill.deposit > 0) {
        addTotalRow('Deposit', bill.deposit);
      }

      if (bill.registrationFee > 0) {
        addTotalRow('Registration Fee', bill.registrationFee);
      }

      addTotalRow('Subtotal', bill.subtotal);

      if (bill.discount > 0) {
        addTotalRow('Discount', -bill.discount, false, '#10b981');
      }

      addTotalRow('Taxable Amount', bill.taxableAmount);
      addTotalRow(`GST (${bill.priceSnapshot.gstPercentage}%)`, bill.gstAmount);

      y += 5;
      doc.moveTo(320, y).lineTo(545, y).strokeColor('#111827').lineWidth(1.5).stroke();
      y += 8;

      doc
        .fontSize(13)
        .fillColor('#111827')
        .text('TOTAL AMOUNT', 320, y)
        .text(`₹${bill.totalAmount.toFixed(2)}`, 440, y, { align: 'right' });

      y += 30;

      // ==================== PAYMENT STATUS ====================
      const statusColors = {
        pending: '#f59e0b',
        paid: '#10b981',
        overdue: '#ef4444',
        partially_paid: '#3b82f6',
      };

      const statusLabels = {
        pending: 'PAYMENT PENDING',
        paid: 'PAID',
        overdue: 'OVERDUE',
        partially_paid: 'PARTIALLY PAID',
      };

      const statusColor = statusColors[bill.paymentStatus] || '#6b7280';

      doc
        .roundedRect(50, y, 150, 28, 5)
        .fillColor(statusColor)
        .fill();

      doc
        .fontSize(10)
        .fillColor('#ffffff')
        .text(statusLabels[bill.paymentStatus] || bill.paymentStatus.toUpperCase(), 60, y + 8);

      if (bill.paymentStatus === 'paid' && bill.paidAt) {
        const paidStr = new Date(bill.paidAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
        doc
          .fontSize(9)
          .fillColor('#6b7280')
          .text(`Paid on: ${paidStr}`, 210, y + 9);
      }

      y += 45;

      // ==================== ATTENDANCE SUMMARY ====================
      doc
        .fontSize(10)
        .fillColor('#6b7280')
        .text(
          `Total attendance days: ${bill.mealCounts.totalDays} | Total meals consumed: ${bill.mealCounts.totalMeals}`,
          50,
          y
        );

      if (bill.notes) {
        y += 18;
        doc
          .fontSize(9)
          .fillColor('#6b7280')
          .text(`Notes: ${bill.notes}`, 50, y);
      }

      // ==================== FOOTER ====================
      const footerY = doc.page.height - 80;

      doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor('#e5e7eb').lineWidth(0.5).stroke();

      doc
        .fontSize(8)
        .fillColor('#9ca3af')
        .text(
          'This is a computer-generated invoice. No signature required.',
          50,
          footerY + 10,
          { align: 'center', width: pageWidth }
        )
        .text(
          `Generated by MessMate • ${bill.billNumber}`,
          50,
          footerY + 22,
          { align: 'center', width: pageWidth }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateBillPDF };
