const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

router.use(express.json());

const prisma = new PrismaClient();

// Route to create a new sheet entry
router.post('/submit-form', async (req, res) => {
  const { 
    id, 
    name, 
    subjectCode, 
    MST1_Q1, 
    MST1_Q2, 
    MST1_Q3, 
    MST2_Q1, 
    MST2_Q2, 
    MST2_Q3, 
    Quiz_Assignment, 
    EndSem_Q1, 
    EndSem_Q2, 
    EndSem_Q3, 
    EndSem_Q4, 
    EndSem_Q5 
  } = req.body;

  try {
    // Find the teacher based on subjectCode
    const subject = await prisma.subject.findUnique({
      where: {
        code: subjectCode,
      },
      include: {
        teacher: true, // Include the teacher data in the result
      },
    });

    if (!subject || !subject.teacher) {
      return res.status(404).json({ error: 'Subject or Teacher not found' });
    }

    // Create the new sheet and connect it with the subject and teacher
    await prisma.sheet.create({
      data: {
        id,
        name,
        subjectCode,
        teacherId: subject.teacher.id, // Dynamically connect teacher through subjectCode
        MST1_Q1: parseInt(MST1_Q1),
        MST1_Q2: parseInt(MST1_Q2),
        MST1_Q3: parseInt(MST1_Q3),
        MST2_Q1: parseInt(MST2_Q1),
        MST2_Q2: parseInt(MST2_Q2),
        MST2_Q3: parseInt(MST2_Q3),
        EndSem_Q1: parseInt(EndSem_Q1),
        EndSem_Q2: parseInt(EndSem_Q2),
        EndSem_Q3: parseInt(EndSem_Q3),
        EndSem_Q4: parseInt(EndSem_Q4),
        EndSem_Q5: parseInt(EndSem_Q5),
        Quiz_Assignment: parseInt(Quiz_Assignment)
      },
    });

    res.status(201).json({ message: 'Form data saved successfully' });
  } catch (error) {
    console.error('Error saving form data:', error);
    res.status(500).json({ error: 'Error saving form data' });
  }
});

// Route to get all rows from the Sheet table with a specific subjectCode
router.get('/sheets', async (req, res) => {
  const { subjectCode } = req.query; // Retrieve subjectCode from query parameter

  try {
    const sheets = await prisma.sheet.findMany({
      where: {
        subjectCode: subjectCode, // Filter records based on subjectCode
      },
    });
    res.status(200).json(sheets);
  } catch (error) {
    console.error('Error fetching sheets:', error);
    res.status(500).json({ error: 'Error fetching sheets' });
  }
});

// Route to update a specific sheet entry by ID and subjectCode
router.put('/sheets/:id/:subjectCode', async (req, res) => {
  const { id, subjectCode } = req.params;
  const {         
    name,
    MST1_Q1,
    MST1_Q2,
    MST1_Q3,
    MST2_Q1,
    MST2_Q2,
    MST2_Q3,
    Quiz_Assignment,
    EndSem_Q1,
    EndSem_Q2,
    EndSem_Q3,
    EndSem_Q4,
    EndSem_Q5 
  } = req.body;

  try {
    const updatedSheet = await prisma.sheet.update({
      where: {
        id_subjectCode: {
          id: id,
          subjectCode: subjectCode,
        },
      },
      data: {
        name,
        MST1_Q1,
        MST1_Q2,
        MST1_Q3,
        MST2_Q1,
        MST2_Q2,
        MST2_Q3,
        Quiz_Assignment,
        EndSem_Q1,
        EndSem_Q2,
        EndSem_Q3,
        EndSem_Q4,
        EndSem_Q5
      },
    });

    res.status(200).json(updatedSheet);
  } catch (error) {
    console.error('Error updating sheet:', error);
    res.status(500).json({ error: 'Error updating sheet' });
  }
});

const ExcelJS = require('exceljs');

// Route to download an Excel sheet with calculations and averages
router.get('/download-sheets', async (req, res) => {
  const { subjectCode } = req.query; // Get subjectCode from query parameter

  try {
    // Fetch the sheets for the specified subjectCode
    const sheets = await prisma.sheet.findMany({
      where: {
        subjectCode: subjectCode,
      },
    });

    if (sheets.length === 0) {
      return res.status(404).json({ error: 'No sheets found for this subject code.' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet Data');

    // Add header row
    worksheet.columns = [
      { header: 'Enrollment Number', key: 'id', width: 20 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Subject Code', key: 'subjectCode', width: 15 },
      { header: 'MST1_Q1', key: 'MST1_Q1', width: 10 },
      { header: 'MST1_Q2', key: 'MST1_Q2', width: 10 },
      { header: 'MST1_Q3', key: 'MST1_Q3', width: 10 },
      { header: 'MST1_Total', key: 'MST1_Total', width: 15 },
      { header: 'MST2_Q1', key: 'MST2_Q1', width: 10 },
      { header: 'MST2_Q2', key: 'MST2_Q2', width: 10 },
      { header: 'MST2_Q3', key: 'MST2_Q3', width: 10 },
      { header: 'MST2_Total', key: 'MST2_Total', width: 15 },
      { header: 'MST_Best', key: 'MST_Best', width: 15 },
      { header: 'Quiz/Assignment', key: 'Quiz_Assignment', width: 20 },
      { header: 'EndSem_Q1', key: 'EndSem_Q1', width: 10 },
      { header: 'EndSem_Q2', key: 'EndSem_Q2', width: 10 },
      { header: 'EndSem_Q3', key: 'EndSem_Q3', width: 10 },
      { header: 'EndSem_Q4', key: 'EndSem_Q4', width: 10 },
      { header: 'EndSem_Q5', key: 'EndSem_Q5', width: 10 },
      { header: 'EndSem_Total', key: 'EndSem_Total', width: 15 },
    ];

    // Add data rows with calculations for MST1_Total, MST2_Total, MST_Best, and EndSem_Total
    sheets.forEach((sheet) => {
      const MST1_Total = (sheet.MST1_Q1 || 0) + (sheet.MST1_Q2 || 0) + (sheet.MST1_Q3 || 0);
      const MST2_Total = (sheet.MST2_Q1 || 0) + (sheet.MST2_Q2 || 0) + (sheet.MST2_Q3 || 0);
      const MST_Best = Math.max(MST1_Total, MST2_Total);
      const EndSem_Total = (sheet.EndSem_Q1 || 0) + (sheet.EndSem_Q2 || 0) + (sheet.EndSem_Q3 || 0) + (sheet.EndSem_Q4 || 0) + (sheet.EndSem_Q5 || 0);

      worksheet.addRow({
        id: sheet.id,
        name: sheet.name,
        subjectCode: sheet.subjectCode,
        MST1_Q1: sheet.MST1_Q1,
        MST1_Q2: sheet.MST1_Q2,
        MST1_Q3: sheet.MST1_Q3,
        MST1_Total,
        MST2_Q1: sheet.MST2_Q1,
        MST2_Q2: sheet.MST2_Q2,
        MST2_Q3: sheet.MST2_Q3,
        MST2_Total,
        MST_Best,
        Quiz_Assignment: sheet.Quiz_Assignment,
        EndSem_Q1: sheet.EndSem_Q1,
        EndSem_Q2: sheet.EndSem_Q2,
        EndSem_Q3: sheet.EndSem_Q3,
        EndSem_Q4: sheet.EndSem_Q4,
        EndSem_Q5: sheet.EndSem_Q5,
        EndSem_Total,
      });
    });

    // Add the average row at the end of the data
    const lastRowNumber = worksheet.lastRow.number;
    worksheet.addRow({
      id: 'Average',
      MST1_Q1: { formula: `AVERAGE(D2:D${lastRowNumber})` },
      MST1_Q2: { formula: `AVERAGE(E2:E${lastRowNumber})` },
      MST1_Q3: { formula: `AVERAGE(F2:F${lastRowNumber})` },
      MST1_Total: { formula: `AVERAGE(G2:G${lastRowNumber})` },
      MST2_Q1: { formula: `AVERAGE(H2:H${lastRowNumber})` },
      MST2_Q2: { formula: `AVERAGE(I2:I${lastRowNumber})` },
      MST2_Q3: { formula: `AVERAGE(J2:J${lastRowNumber})` },
      MST2_Total: { formula: `AVERAGE(K2:K${lastRowNumber})` },
      MST_Best: { formula: `AVERAGE(L2:L${lastRowNumber})` },
      Quiz_Assignment: { formula: `AVERAGE(M2:M${lastRowNumber})` },
      EndSem_Q1: { formula: `AVERAGE(N2:N${lastRowNumber})` },
      EndSem_Q2: { formula: `AVERAGE(O2:O${lastRowNumber})` },
      EndSem_Q3: { formula: `AVERAGE(P2:P${lastRowNumber})` },
      EndSem_Q4: { formula: `AVERAGE(Q2:Q${lastRowNumber})` },
      EndSem_Q5: { formula: `AVERAGE(R2:R${lastRowNumber})` },
      EndSem_Total: { formula: `AVERAGE(S2:S${lastRowNumber})` },
    }).font = { bold: true }; // Make the average row bold

    // Set response headers for the download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=sheets.xlsx');

    // Write the Excel file to the response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating Excel sheet:', error);
    res.status(500).json({ error: 'Error generating Excel sheet' });
  }
});

module.exports = router;