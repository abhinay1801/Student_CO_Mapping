import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SetEntry = () => {
  const [existingSubjects, setExistingSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [sets, setSets] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5000/api/sets/fetchSubjects",
          {
            headers: { Authorization: token },
          }
        );
        const data = await response.json();

        if (response.ok) {
          setExistingSubjects(data.subjects);
        } else {
          console.error("Error fetching subjects:", data.error);
        }
      } catch (error) {
        console.error("Server error:", error);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject && existingSubjects.includes(selectedSubject)) {
      fetchSets(selectedSubject);
    } else if (selectedSubject) {
      setSets(
        Array.from({ length: 10 }, () => ({
          setNumber: "",
          questions: ["", ""],
          coNumbers: ["", ""],
        }))
      );
    }
  }, [selectedSubject]);

  const fetchSets = async (subject) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/sets/fetchSets?subject=${encodeURIComponent(
          subject
        )}`,
        {
          headers: { Authorization: token },
        }
      );
      const data = await response.json();

      if (!response.ok) {
        console.error("Error fetching sets:", data.error);
        setSets([]);
        return;
      }

      setSets(data.sets || []);
    } catch (error) {
      console.error("Server error:", error);
      setSets([]);
    }
  };

  const handleAddNewSubject = () => {
    if (!newSubject.trim()) {
      alert("Please enter a valid subject name.");
      return;
    }

    setSelectedSubject(newSubject);
    setNewSubject("");
    setSets(
      Array.from({ length: 10 }, () => ({
        setNumber: "",
        questions: ["", ""],
        coNumbers: ["", ""],
      }))
    );
  };

  const handleInputChange = (setIndex, field, value, questionIndex) => {
    setSets((prevSets) => {
      const updatedSets = [...prevSets];
      if (field === "setNumber") {
        updatedSets[setIndex].setNumber = value;
      } else if (field === "questions") {
        updatedSets[setIndex].questions[questionIndex] = value;
      } else if (field === "coNumbers") {
        updatedSets[setIndex].coNumbers[questionIndex] = value;
      }
      return updatedSets;
    });
  };
  

  const handleSubmit = async () => {
    if (!selectedSubject) {
      alert("Please select or enter a subject before submitting.");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/sets/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ subject: selectedSubject, sets }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        navigate("/detailsentry", { state: { subject: selectedSubject } });
      } else {
        alert(data.error || "Error storing sets.");
      }
    } catch (error) {
      console.error("Error storing sets:", error);
      alert("Server error while storing sets.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h2 className="text-3xl font-bold text-blue-700 mb-6">Set Entry</h2>

      <div className="mb-4 w-full max-w-md">
        <label className="block text-gray-700">Select an existing subject:</label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="border p-2 rounded-md w-full"
        >
          <option value="">-- Select Subject --</option>
          {existingSubjects.map((subject, index) => (
            <option key={index} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6 w-full max-w-md">
        <label className="block text-gray-700">Or enter a new subject:</label>
        <input
          type="text"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          className="border p-2 rounded-md w-full"
          placeholder="Enter new subject"
        />
        <button
          onClick={handleAddNewSubject}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full"
        >
          Add New Subject
        </button>
      </div>

      {selectedSubject && (
        <div className="w-full max-w-4xl">
          <h2 className="text-xl font-bold mb-4 text-blue-700">Enter 10 Sets</h2>

          {sets.map((set, index) => (
            <div key={index} className="bg-white shadow-lg rounded-lg p-6 mb-4">
              <div className="mb-3">
                <label className="block text-gray-700">Set {index + 1} Number:</label>
                <input
                  type="text"
                  value={set.setNumber}
                  onChange={(e) => handleInputChange(index, "setNumber", e.target.value)}
                  className="border p-2 rounded-md w-full"
                />
              </div>

              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  placeholder="Question 1"
                  value={set.questions[0]}
                  onChange={(e) => handleInputChange(index, "questions", e.target.value, 0)}
                  className="border p-2 rounded-md w-full"
                />
                <input
                  type="text"
                  placeholder="CO Number 1"
                  value={set.coNumbers[0]}
                  onChange={(e) => handleInputChange(index, "coNumbers", e.target.value, 0)}
                  className="border p-2 rounded-md w-24"
                />
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Question 2"
                  value={set.questions[1]}
                  onChange={(e) => handleInputChange(index, "questions", e.target.value, 1)}
                  className="border p-2 rounded-md w-full"
                />
                <input
                  type="text"
                  placeholder="CO Number 2"
                  value={set.coNumbers[1]}
                  onChange={(e) => handleInputChange(index, "coNumbers", e.target.value, 1)}
                  className="border p-2 rounded-md w-24"
                />
              </div>
            </div>
          ))}

          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-600 transition duration-300"
          >
            Submit Sets
          </button>
        </div>
      )}
    </div>
  );
};

export default SetEntry;
