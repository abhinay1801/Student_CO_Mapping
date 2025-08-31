import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { generateRollNumbers } from "./rollNumberHelper";
import { debounce } from "lodash";
import * as XLSX from "xlsx";
import "../App.css";

function TableEntry() {
  const location = useLocation();
  const {
    academicYear = "",
    Branch = "",
    Section = "",
    ExamMonth = "",
    Semester = "",
    Year = "",
    LabName = "",
    ExternalExaminer = "",
    InternalExaminer = "",
    ExamDate = "",
    MaxMarks = "",
    Regulation = "",
    subject = "",
  } = location.state || {};

  if (!academicYear || !Branch || !Section) {
    return <h1 className="text-center text-xl mt-10">Invalid Data</h1>;
  }

  const [rollNumbers, setRollNumbers] = useState(
    generateRollNumbers(academicYear, Branch, Section)
  );
  const [newRollNumber, setNewRollNumber] = useState("");
  const [setNumbers, setSetNumbers] = useState({});
  const [marks, setMarks] = useState({});
  const [setDetails, setSetDetails] = useState({});

  const handleAddRow = () => {
    if (newRollNumber && !rollNumbers.includes(newRollNumber)) {
      setRollNumbers((prev) => [...prev, newRollNumber]);
      setNewRollNumber("");
    }
  };

  const handleDeleteRow = (rollNumber) => {
    setRollNumbers((prev) => prev.filter((item) => item !== rollNumber));
    const updatedSetNumbers = { ...setNumbers };
    delete updatedSetNumbers[rollNumber];
    setSetNumbers(updatedSetNumbers);

    const updatedMarks = { ...marks };
    delete updatedMarks[rollNumber];
    setMarks(updatedMarks);

    const updatedSetDetails = { ...setDetails };
    delete updatedSetDetails[rollNumber];
    setSetDetails(updatedSetDetails);
  };

  const handleMarksChange = (rollNumber, field, value) => {
    setMarks((prev) => ({
      ...prev,
      [rollNumber]: {
        ...prev[rollNumber],
        [field]: value,
      },
    }));
  };

  const fetchSetDetailsDebounced = debounce(async (setNum, rollNumber) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not authenticated. Please login.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/sets/fetchSets?subject=${subject}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const setData = data.sets[setNum - 1];

        if (setData) {
          const dividedQuestions = {
            program1: setData.questions?.slice(0, setData.questions.length / 2),
            program2: setData.questions?.slice(setData.questions.length / 2),
            co1: setData.coNumbers?.slice(0, setData.coNumbers.length / 2),
            co2: setData.coNumbers?.slice(setData.coNumbers.length / 2),
          };

          setSetDetails((prev) => ({
            ...prev,
            [rollNumber]: dividedQuestions,
          }));
        } else {
          alert("Set number not found.");
        }
      } else {
        alert("No set details found.");
      }
    } catch (error) {
      console.error("Error fetching set details:", error);
    }
  }, 500);

  useEffect(() => {
    Object.entries(setNumbers).forEach(([rollNumber, setNum]) => {
      if (setNum) fetchSetDetailsDebounced(setNum, rollNumber);
    });
  }, [setNumbers]);

  const handleSetNumberChange = (rollNumber, value) => {
    setSetNumbers((prev) => {
      const updatedSetNumbers = { ...prev, [rollNumber]: value };
      if (value) {
        fetchSetDetailsDebounced(value, rollNumber);
      }

      return updatedSetNumbers;
    });
  };

  const calculateTotalMarks = (rollNumber) => {
    const studentMarks = marks[rollNumber] || {};
    const writeUp = parseInt(studentMarks.writeUp) || 0;
    const compileErrors = parseInt(studentMarks.compileErrors) || 0;
    const execution = parseInt(studentMarks.execution) || 0;
    const programSyntax = parseInt(studentMarks.programSyntax) || 0;
    const vivaVoice = parseInt(studentMarks.vivaVoice) || 0;
    return writeUp + compileErrors + execution + programSyntax + vivaVoice;
  };

  const downloadPDF = () => {
    window.print();
  };

  const downloadExcel = () => {
    const data = rollNumbers.map((rollNumber, index) => ({
      "S. No.": index + 1,
      "Set No.": setNumbers[rollNumber] || "",
      "Hall Ticket": rollNumber,
      "Program 1 Executed": setDetails[rollNumber]?.program1?.join(", ") || "-",
      "Mapping CO 1": setDetails[rollNumber]?.co1?.join(", ") || "-",
      "Write Up (10M)": marks[rollNumber]?.writeUp || "",
      "Compile Errors (15M)": marks[rollNumber]?.compileErrors || "",
      "Execution (15M)": marks[rollNumber]?.execution || "",
      "Program 2 Executed": setDetails[rollNumber]?.program2?.join(", ") || "-",
      "Mapping CO 2": setDetails[rollNumber]?.co2?.join(", ") || "-",
      "Program & Syntax (10M)": marks[rollNumber]?.programSyntax || "",
      "Viva-Voice (10M)": marks[rollNumber]?.vivaVoice || "",
      "Total Marks (60M)": calculateTotalMarks(rollNumber),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Marks Data");
    XLSX.writeFile(wb, "marksheet.xlsx");
  };

  return (
    <div className="p-3 min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto bg-white p-2">
        <div className="flex justify-center items-center border w-full h-23">
          <div className="text-center border-r w-[820px] h-full">
            <h1 className="text-2xl font-bold font-serif ">CVR COLLEGE OF ENGINEERING</h1>
            <p className="text-lg font-semibold font-serif">An UGC Autonomous Institution Affiliated to JNTUH</p>
            <p className="text-sm font-semibold font-serif">Vastunagar, Mangalpally (V), Ibrahimpatnam (M), Ranga Reddy District - 501510</p>
          </div>
          <div className="flex flex-col justify-center items-center w-[180px] h-full">
            <h1 className="text-center text-xl font-bold font-serif">College Code</h1>
            <h1 className="text-2xl font-bold font-serif ">B8</h1>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <h2 className="text-lg font-bold mt-2 mb-3 text-center underline ">AWARD LIST (LABORATORY)</h2>
          <div className="flex gap-3 w-full">
            <div className="w-[60%]">
              <label className=" inline text-sm font-semibold font-serif ">Name of Exam:</label>
              <input
                type="text"
                className="text-sm w-[80%] border-b focus:outline-none border-black inline-block"
                value={`  B-TECH ${Year} YEAR SEM-${Semester}`}
                readOnly
              />
            </div>
            <div className="flex w-[40%]">
              <label className=" inline text-sm font-semibold font-serif ">(Reg./Supp)Month:</label>
              <input
                type="text"
                className="pl-2 text-sm w-[64%] border-b focus:outline-none border-black inline-block"
                value={ExamMonth}
                readOnly
              />
            </div>
          </div>
          <div className="mt-3 w-full">
            <label className=" inline text-sm font-semibold font-serif ">Branch & Section:</label>
            <input
              type="text"
              className="pl-2 text-sm w-[60%] border-b focus:outline-none border-black inline-block"
              value={`${Branch}-${Section}`}
              readOnly
            />
            <label className="pl-2 inline text-sm font-semibold font-serif">Regulation:</label>
            <input
              type="text"
              className="pl-2 text-sm w-[19%] border-b focus:outline-none border-black inline-block"
              value={Regulation}
              readOnly
            />
          </div>
          <div className="flex mt-3 w-full">
            <div className="w-[50%]">
              <label className="text-sm font-semibold font-serif ">Name of Lab:</label>
              <input
                type="text"
                className="pl-2 text-sm w-[80%] border-b focus:outline-none border-black inline-block"
                value={LabName}
                readOnly
              />
            </div>
            <div className="w-[30%]">
              <label className="text-sm font-semibold font-serif ">Date of Examination:</label>
              <input
                type="date"
                className="pl-2 text-sm w-[50%] border-b focus:outline-none border-black inline-block"
                value={ExamDate}
                readOnly
              />
            </div>
            <div className="w-[20%]">
              <label className="text-sm font-semibold font-serif ">Max.Marks:</label>
              <input
                type="number"
                className="pl-2 text-sm w-[55%] border-b focus:outline-none border-black inline-block"
                value={MaxMarks}
                readOnly
              />
            </div>
          </div>
          <div className="w-full flex mt-3">
            <label className="text-sm font-semibold font-serif ">Name & College of External Examiner:</label>
            <input
              type="text"
              className="pl-2 text-sm w-[74%] border-b focus:outline-none border-black inline-block"
              value={ExternalExaminer}
              readOnly
            />
          </div>
          <div className="flex w-full mt-3">
            <label className="text-sm font-semibold font-serif ">Name of Internal Examiner:</label>
            <input
              type="text"
              className="pl-2 text-sm w-[80.5%] border-b focus:outline-none  inline-block"
              value={InternalExaminer}
              readOnly
            />
          </div>
        </div>
        <div className="w-full mt-3">
          <div className="flex items-start">
            <p className="text-sm font-semibold font-serif mr-2">Note:</p>
            <p>1) Please enter the marks in the serial order of the Hall Ticket Numbers of the students.</p>
          </div>
          <p className="ml-12">2) The award list must be submitted to the Controller of Examinations along with a Statement of Attendance.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse border border-gray-300 mt-6">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-1">S. No.</th>
                <th className="border border-gray-300 p-1 no-print">Set No.</th>
                <th className="border border-gray-300 p-1">Hall Ticket Number</th>
                <th className="border border-gray-300 p-1">Program 1 Executed</th>
                <th className="border border-gray-300 p-1">Mapping CO</th>
                <th className="border border-gray-300 p-1">Write Up (10M)</th>
                <th className="border border-gray-300 p-1">Compile Errors (15M)</th>
                <th className="border border-gray-300 p-1">Execution (15M)</th>
                <th className="border border-gray-300 p-1">Program 2 Executed</th>
                <th className="border border-gray-300 p-1">Mapping CO 2</th>
                <th className="border border-gray-300 p-1">Program & Syntax (10M)</th>
                <th className="border border-gray-300 p-1">Viva-Voice (10M)</th>
                <th className="border border-gray-300 p-1">Total Marks (60M)</th>
                <th className="border border-gray-300 p-1 no-print">Action</th>
              </tr>
            </thead>
            <tbody>
              {rollNumbers.map((rollNumber, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-1 text-center">{index + 1}</td>
                  <td className="border border-gray-300 p-1 no-print">
                    <input
                      type="text"
                      className="w-full border-none outline-none text-sm"
                      value={setNumbers[rollNumber] || ""}
                      onChange={(e) => handleSetNumberChange(rollNumber, e.target.value)}
                    />
                  </td>
                  <td className="border border-gray-300 p-1 text-center">{rollNumber}</td>
                  <td className="border border-gray-300 p-1">
                    {setDetails[rollNumber]?.program1?.join(", ") || "-"}
                  </td>
                  <td className="border border-gray-300 p-1">
                    {setDetails[rollNumber]?.co1?.join(", ") || "-"}
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input
                      type="number"
                      className="w-full border-none outline-none text-sm"
                      value={marks[rollNumber]?.writeUp || ""}
                      onChange={(e) => handleMarksChange(rollNumber, "writeUp", e.target.value)}
                    />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input
                      type="number"
                      className="w-full border-none outline-none text-sm"
                      value={marks[rollNumber]?.compileErrors || ""}
                      onChange={(e) => handleMarksChange(rollNumber, "compileErrors", e.target.value)}
                    />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input
                      type="number"
                      className="w-full border-none outline-none text-sm"
                      value={marks[rollNumber]?.execution || ""}
                      onChange={(e) => handleMarksChange(rollNumber, "execution", e.target.value)}
                    />
                  </td>
                  <td className="border border-gray-300 p-1">
                    {setDetails[rollNumber]?.program2?.join(", ") || "-"}
                  </td>
                  <td className="border border-gray-300 p-1">
                    {setDetails[rollNumber]?.co2?.join(", ") || "-"}
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input
                      type="number"
                      className="w-full border-none outline-none text-sm"
                      value={marks[rollNumber]?.programSyntax || ""}
                      onChange={(e) => handleMarksChange(rollNumber, "programSyntax", e.target.value)}
                    />
                  </td>
                  <td className="border border-gray-300 p-1">
                    <input
                      type="number"
                      className="w-full border-none outline-none text-sm"
                      value={marks[rollNumber]?.vivaVoice || ""}
                      onChange={(e) => handleMarksChange(rollNumber, "vivaVoice", e.target.value)}
                    />
                  </td>
                  <td className="border border-gray-300 p-1 text-center">
                    {calculateTotalMarks(rollNumber)}
                  </td>
                  <td className="border border-gray-300 p-1 text-center no-print">
                    <button
                      onClick={() => handleDeleteRow(rollNumber)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200"
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <br /><br /><br /><br /><br /><br />
        <div className="flex items-center justify-between p-6">
          <div>
            internal signature
          </div>
          <div>
            external signature
          </div>

        </div>

        <div className="mt-4 flex items-center space-x-4">
          <p className="text-lg font-semibold text-gray-700 no-print">Add New Roll Number</p>
          <input
            type="text"
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 w-60 no-print"
            placeholder="Enter New Roll Number"
            value={newRollNumber}
            onChange={(e) => setNewRollNumber(e.target.value)}
          />
          <button
            onClick={handleAddRow}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 no-print"
          >
            Add Row
          </button>
        </div>

        <div className="flex justify-center mt-6 ">
          <button onClick={downloadPDF} className="bg-blue-500 text-white p-2 rounded-md mr-4  cursor-pointer no-print">
            Download PDF
          </button>
          <button onClick={downloadExcel} className="bg-green-500 text-white p-2 rounded-md  cursor-pointer no-print">
            Download Excel
          </button>

        </div>
      </div>

    </div>
  );
}

export default TableEntry;