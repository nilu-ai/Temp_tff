import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Header from '../../../Navbar/header';
import { useSelector } from 'react-redux';
import Modal from './Autogeneratedtest'; // Import the Modal component
import { MdDelete } from 'react-icons/md';
import { IoIosAdd, IoIosSend } from 'react-icons/io';
import { GiRollingEnergy } from 'react-icons/gi';

const TestComponent = () => {
  const standards = Array.from({ length: 10 }, (_, i) => i + 1); // Fixed standards 1 to 10
  const [subjects, setSubjects] = useState([]);
  const [selectedStandard, setSelectedStandard] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [questions, setQuestions] = useState([]);
  const [scores, setScores] = useState([]);
  const teacherId = useSelector(store=>store.user.data._id)
  const [isSideNavOpen, setIsSideNavOpen] = useState(false)
  const [success,setsuccess]=useState('')
    const name=useRef('')

  const getSubjects = async (standardId) => {
    try {
      const response = await axios.get(`https://backend-pro-learning.vercel.app/api/subjects/standard/${standardId}`);
      return response.data.data.standards[0] ? response.data.data.standards[0].subjects : [];
    } catch (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }
  };

  const getChapters = async (subjectId) => {
    try {
      const response = await axios.get(`https://backend-pro-learning.vercel.app/api/subjects/${subjectId}`);
      return response.data.data.chapters;
    } catch (error) {
      console.error('Error fetching chapters:', error);
      return [];
    }
  };

  const getTopics = async (chapterId) => {
    try {
      const response = await axios.get(`https://backend-pro-learning.vercel.app/api/chapters/${chapterId}`);
      return response.data.data.topics;
    } catch (error) {
      console.error('Error fetching topics:', error);
      return [];
    }
  };

  useEffect(() => {
    if (selectedStandard) {
      const fetchSubjects = async () => {
        const subjectsData = await getSubjects(selectedStandard);
        setSubjects(subjectsData);
      };
      fetchSubjects();
    }
  }, [selectedStandard]);

  const handleScoreChange = (index, newScore) => {
    const newScores = [...scores];
    newScores[index] = newScore;
    setScores(newScores);
  };

  const handleTopicChange = (questionIndex, topicId) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].topicId = topicId;
    setQuestions(newQuestions);
  };

  const handleChapterChange = async (questionIndex, chapterId) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].chapterId = chapterId;

    const topicsData = await getTopics(chapterId);
    newQuestions[questionIndex].topics = topicsData;
    setQuestions(newQuestions);
  };

  const handleSubjectChange = async (subjectId) => {
    setSelectedSubject(subjectId);
    setQuestions([]);
    const chaptersData = await getChapters(subjectId);
    setQuestions([{ chapterId: '', topics: [], question: '', topicId: '', score: 0, availableChapters: chaptersData }]);
    setScores([0]);
  };

  const handleQuestionChange = (index, question) => {
    const newQuestions = [...questions];
    newQuestions[index].question = question;
    setQuestions(newQuestions);
  };

  const handleAddQuestion = async () => {
    const chaptersData = await getChapters(selectedSubject);
    setQuestions([...questions, { chapterId: '', topics: [], question: '', topicId: '', score: 0, availableChapters: chaptersData }]);
    setScores([...scores, 0]);
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);

    const newScores = [...scores];
    newScores.splice(index, 1);
    setScores(newScores);
  };

  const handleSubmit = () => {
    const formattedData = {
        teacherId,
        name:name.current.value,
        questions: questions.map((q, index) => ({
        question: q.question,
        topicId: q.topicId,
        score: scores[index] || 0,

      })),
      score: scores.reduce((acc, score) => acc + score, 0),
      standard:selectedStandard,
      subjectid:selectedSubject
    };
    console.log(formattedData);

    axios.defaults.withCredentials = true;
    axios
      .post(
        `${process.env.REACT_APP_API_URL}/api/physicaltest/physical-tests`,formattedData
      )
      .then((res) => {
        console.log(res.data.data);
        setsuccess('Test Successfully created')
        // if(res.data.data)
      }).catch(err=>console.log(err))
  };
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleButtonClick = (standard, subject) => {
    setIsModalOpen(true);
    // Optionally, you can pass the standard and subject IDs to the modal here if needed
  };

  const handleCloseModal = (data) => {
    setIsModalOpen(false);
    console.log("log",data);
    
    if(data)
    {setQuestions(data)}

  };

  return (
    <>
     <div className={`${isSideNavOpen? 'sm:ml-64': ''}`} >
     <Header isSideNavOpen={isSideNavOpen} setIsSideNavOpen={setIsSideNavOpen}/>
         <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
     <h1 className="text-3xl font-semibold mb-6 text-gray-800">Create New Test</h1>
      { <input
            type="text"
            ref={name}
            placeholder="The test name"
           className="block w-full mt-2 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
          />}
      <div className="mb-6 mt-4">
      <label className="block text-gray-700 font-medium">Standard:</label>
        <select
          value={selectedStandard}
          onChange={(e) => {
            setSelectedStandard(e.target.value);
            setSubjects([]);
            setSelectedSubject('');
            setQuestions([]);
          }}
         className="block w-full mt-2 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Standard</option>
          {standards.map((standard) => (
            <option key={standard} value={standard}>
              {standard}
            </option>
          ))}
        </select>
      </div>

      {subjects.length > 0 && (
        <div className="mb-5">
          <label className="block text-gray-700 font-medium">Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className="block w-full mt-2 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
      )}

{(selectedStandard && selectedSubject && !isModalOpen) && 
      
      <div  onClick={() => handleButtonClick(selectedStandard, selectedSubject)} className="mt-6 p-2 w-fit flex flex-row justify-between items-center bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 cursor-pointer"><GiRollingEnergy color='gra' size={30}/> <span className='ml-2' >Genrate the Test Question</span> </div> 

      }

      {isModalOpen && (
        
        <div className="pt-40 fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto ">
      <div className=" p-6 rounded-lg shadow-lg relative">
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          standard={selectedStandard} // Example standard ID
          subject={selectedSubject} // Example subject ID
        />
        </div></div>
      )}

  

{questions.map((q, index) => (
          <div key={index} className="p-5 border-b border-gray-300">
            <div className='flex flex-col gap-4'>
              <div className='flex flex-row gap-4'>
              <input
                type="text"
                value={q.question}
                onChange={(e) => handleQuestionChange(index, e.target.value)}
                placeholder="Enter question"
                className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
              /> 
                  <MdDelete size={40} onClick={() => handleRemoveQuestion(index)}
                  className="mt-1" color='red'/>
              
                </div>
              <div className="flex gap-4">
               
                <select
                  value={q.chapterId}
                  onChange={(e) => handleChapterChange(index, e.target.value)}
                  className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{q.topicId ? "Already Linked" : "Select Chapter"}</option>
                  {q.availableChapters &&
                    q.availableChapters.map((chapter) => (
                      <option key={chapter._id} value={chapter._id}>
                        {chapter.name}
                      </option>
                    ))}
                </select>
                <select
                  value={q.topicId}
                  onChange={(e) => handleTopicChange(index, e.target.value)}
                  className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{q.topicId ? "Already Linked" : "Select Topic"}</option>
                  {q.topics &&
                    q.topics.map((topic) => (
                      <option key={topic._id} value={topic._id}>
                        {topic.name}
                      </option>
                    ))}
                </select>
                <input
                  type="number"
                  value={scores[index] || q.score}
                  onChange={(e) => handleScoreChange(index, parseInt(e.target.value, 10) || 0)}
                  placeholder="Enter score"
                  className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
    
      <div onClick={handleAddQuestion} className="mt-6  p-2 w-fit flex flex-row justify-between items-center bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 cursor-pointer"><IoIosAdd color='gra' size={30}/> <span  >Add Question</span> </div> 


      <div className="mt-6 p-5 bg-gray-100 rounded-lg shadow-md">
          <p className="text-lg font-semibold text-gray-800">Total Marks: {scores.reduce((acc, score) => acc + score, 0)}</p>
        </div>
        <p className={`text-green-500 mt-2 ${success ? 'animate-bounce' : ''}`}>{success}</p>

      
        <div onClick={handleSubmit} className="mt-6 p-2 w-fit flex flex-row justify-between items-center bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 cursor-pointer"><IoIosSend color='gra' size={30}/> <span >Submit</span> </div> 

    </div>
     </div>
    </>
    
  );

};

export default TestComponent;