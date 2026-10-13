'use strict';

// ONE seeder with demo data. Transaction dates are relative to "today",
// so there are always some overdue books when you demo the project.
const dayOffset = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
};

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const stamp = { createdAt: now, updatedAt: now };

    const categories = [
      { id: 1, name: 'Computer Science', description: 'Programming, databases, networks and software engineering' },
      { id: 2, name: 'Mathematics', description: 'Engineering and discrete mathematics' },
      { id: 3, name: 'Fiction', description: 'Novels and short stories' },
      { id: 4, name: 'Management', description: 'Business, economics and management' },
      { id: 5, name: 'Science', description: 'Physics, chemistry and general science' },
    ].map((c) => ({ ...c, ...stamp }));

    // copiesAvailable is calculated below from the open (unreturned) transactions
    const books = [
      { id: 1, title: 'Database System Concepts', author: 'Abraham Silberschatz', isbn: '978-0078022159', publishedYear: 2019, copiesTotal: 4, categoryId: 1 },
      { id: 2, title: 'Learning React', author: 'Alex Banks', isbn: '978-1492051725', publishedYear: 2020, copiesTotal: 3, categoryId: 1 },
      { id: 3, title: 'Node.js Design Patterns', author: 'Mario Casciaro', isbn: '978-1839214110', publishedYear: 2020, copiesTotal: 2, categoryId: 1 },
      { id: 4, title: 'Discrete Mathematics', author: 'Kenneth Rosen', isbn: '978-0073383095', publishedYear: 2018, copiesTotal: 3, categoryId: 2 },
      { id: 5, title: 'Higher Engineering Mathematics', author: 'B. S. Grewal', isbn: '978-8174091956', publishedYear: 2017, copiesTotal: 5, categoryId: 2 },
      { id: 6, title: 'The Guide', author: 'R. K. Narayan', isbn: '978-0143039655', publishedYear: 2006, copiesTotal: 2, categoryId: 3 },
      { id: 7, title: 'Wings of Fire', author: 'A. P. J. Abdul Kalam', isbn: '978-8173711466', publishedYear: 1999, copiesTotal: 4, categoryId: 3 },
      { id: 8, title: 'Principles of Management', author: 'Harold Koontz', isbn: '978-0070139077', publishedYear: 2015, copiesTotal: 3, categoryId: 4 },
      { id: 9, title: 'Concepts of Physics', author: 'H. C. Verma', isbn: '978-8177091878', publishedYear: 2014, copiesTotal: 1, categoryId: 5 },
      { id: 10, title: 'Operating System Concepts', author: 'Abraham Silberschatz', isbn: '978-1119800361', publishedYear: 2021, copiesTotal: 2, categoryId: 1 },
    ];

    const students = [
      { id: 1, name: 'Aarav Sharma', email: 'aarav.sharma@college.edu', enrollmentNo: 'BCA2024001', phone: '9876543210', department: 'BCA' },
      { id: 2, name: 'Priya Nair', email: 'priya.nair@college.edu', enrollmentNo: 'BCA2024002', phone: '9876501234', department: 'BCA' },
      { id: 3, name: 'Rohan Mehta', email: 'rohan.mehta@college.edu', enrollmentNo: 'BCA2024003', phone: '9123456780', department: 'BCA' },
      { id: 4, name: 'Sneha Patil', email: 'sneha.patil@college.edu', enrollmentNo: 'BCOM2024010', phone: '9988776655', department: 'B.Com' },
      { id: 5, name: 'Karan Singh', email: 'karan.singh@college.edu', enrollmentNo: 'BSC2024021', phone: '8877665544', department: 'B.Sc' },
      { id: 6, name: 'Divya Iyer', email: 'divya.iyer@college.edu', enrollmentNo: 'BCA2024004', phone: '7766554433', department: 'BCA' },
    ];

    // [studentId, bookId, issued N days ago, due in N days (relative to today), returned?]
    const plan = [
      { studentId: 1, bookId: 1, issue: -30, due: -16, ret: -18, status: 'Returned', fine: 4 },
      { studentId: 2, bookId: 2, issue: -20, due: -6, ret: -8, status: 'Returned', fine: 0 },
      { studentId: 3, bookId: 4, issue: -25, due: -11, ret: null, status: 'Overdue', fine: 0 },
      { studentId: 4, bookId: 6, issue: -22, due: -8, ret: null, status: 'Overdue', fine: 0 },
      { studentId: 5, bookId: 9, issue: -18, due: -4, ret: null, status: 'Overdue', fine: 0 },
      { studentId: 1, bookId: 2, issue: -5, due: 9, ret: null, status: 'Issued', fine: 0 },
      { studentId: 2, bookId: 7, issue: -3, due: 11, ret: null, status: 'Issued', fine: 0 },
      { studentId: 6, bookId: 3, issue: -2, due: 12, ret: null, status: 'Issued', fine: 0 },
      { studentId: 3, bookId: 1, issue: -1, due: 13, ret: null, status: 'Issued', fine: 0 },
    ];

    const transactions = plan.map((p) => ({
      studentId: p.studentId,
      bookId: p.bookId,
      issueDate: dayOffset(p.issue),
      dueDate: dayOffset(p.due),
      returnDate: p.ret === null ? null : dayOffset(p.ret),
      status: p.status,
      fineAmount: p.fine,
      ...stamp,
    }));

    const openCount = {};
    plan.filter((p) => p.ret === null).forEach((p) => {
      openCount[p.bookId] = (openCount[p.bookId] || 0) + 1;
    });
    const bookRows = books.map((b) => ({
      ...b,
      copiesAvailable: b.copiesTotal - (openCount[b.id] || 0),
      ...stamp,
    }));

    await queryInterface.bulkInsert('categories', categories);
    await queryInterface.bulkInsert('books', bookRows);
    await queryInterface.bulkInsert('students', students.map((s) => ({ ...s, ...stamp })));
    await queryInterface.bulkInsert('transactions', transactions);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('transactions', null, {});
    await queryInterface.bulkDelete('students', null, {});
    await queryInterface.bulkDelete('books', null, {});
    await queryInterface.bulkDelete('categories', null, {});
  },
};
