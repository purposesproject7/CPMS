import React, { useState, useEffect } from 'react';
import PopupReview from '../Components/PopupReview';

import ReviewTable from '../Components/ReviewTable';
import Navbar from '../Components/UniversalNavbar';
import { ChevronRight } from 'lucide-react';
import { 
  getGuideProjects, 
  getDefaultDeadline, 
  updateProject,
  createReviewRequest,
  checkRequestStatus,
  checkAllRequestStatuses
} from '../api';

const Guide = () => {
  const [teams, setTeams] = useState([]);
  const [deadlines, setDeadlines] = useState({});
  const [activePopup, setActivePopup] = useState(null);
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestStatuses, setRequestStatuses] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('=== GUIDE FETCH DATA STARTED ===');
      
      const [projectsRes, deadlinesRes] = await Promise.all([
        getGuideProjects(),
        getDefaultDeadline()
      ]);

      if (projectsRes.data.success) {
        const projects = projectsRes.data.data;
        console.log('Raw guide projects from backend:', projects);
        
        const mappedTeams = projects.map(project => {
          return {
            id: project._id,
            title: project.name,
            description: `Guide: ${project.guideFaculty?.name || 'N/A'}`,
            students: project.students || [],
            pptApproved: project.pptApproved || { approved: false, locked: false },
            guideFaculty: project.guideFaculty
          };
        });
        
        console.log('Mapped guide teams:', mappedTeams);
        setTeams(mappedTeams);
        
        if (mappedTeams.length > 0) {
          const statuses = await checkAllRequestStatuses(mappedTeams);
          setRequestStatuses(statuses);
        }
      }

      if (deadlinesRes.data) {
        const deadlineData = deadlinesRes.data.data || deadlinesRes.data.defaultDeadline || {};
        console.log('=== GUIDE DEADLINES FETCHED ===');
        console.log('Complete deadline data:', deadlineData);
        setDeadlines(deadlineData);
      }
      
      console.log('=== GUIDE FETCH DATA COMPLETED ===');
    } catch (error) {
      console.error('Error fetching guide data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isDeadlinePassed = (reviewType) => {
    if (!deadlines || !deadlines[reviewType]) {
      console.log(`No deadline found for ${reviewType}`);
      return false;
    }
    
    const now = new Date();
    const deadline = deadlines[reviewType];
    
    console.log(`=== DEADLINE CHECK FOR ${reviewType} ===`);
    console.log('Current time:', now.toISOString());
    console.log('Deadline object:', deadline);
    
    if (deadline.from && deadline.to) {
      const fromDate = new Date(deadline.from);
      const toDate = new Date(deadline.to);
      console.log('From date:', fromDate.toISOString());
      console.log('To date:', toDate.toISOString());
      
      const isPassed = now < fromDate || now > toDate;
      console.log(`✅ ${reviewType} deadline passed:`, isPassed);
      return isPassed;
    } else if (typeof deadline === 'string') {
      const deadlineDate = new Date(deadline);
      console.log('Deadline date:', deadlineDate.toISOString());
      const isPassed = now > deadlineDate;
      console.log(`✅ ${reviewType} deadline passed:`, isPassed);
      return isPassed;
    }
    
    return false;
  };

  const isReviewLocked = (student, reviewType) => {
    const studentReview = student[reviewType];
    if (studentReview?.locked) {
      console.log(`Student ${student.name} ${reviewType} is manually locked`);
      return true;
    }
    
    const deadlinePassed = isDeadlinePassed(reviewType);
    console.log(`Student ${student.name} ${reviewType} locked due to deadline:`, deadlinePassed);
    return deadlinePassed;
  };

  // FIX: Updated getTeamRequestStatus - check pending FIRST
  const getTeamRequestStatus = (team, reviewType) => {
    console.log(`=== GETTING TEAM REQUEST STATUS FOR ${reviewType} ===`);
    
    const statuses = team.students.map(student => {
      const requestKey = `${student.regNo}_${reviewType}`;
      const status = requestStatuses[requestKey]?.status || 'none';
      console.log(`Student ${student.name} ${reviewType} status:`, status);
      return status;
    });
    
    // FIX: Check for pending FIRST, before deadline override
    if (statuses.includes('pending')) {
      console.log(`Team ${reviewType} status: pending`);
      return 'pending';
    }
    
    // FIX: Only override to 'none' if deadline passed AND no pending requests
    if (isDeadlinePassed(reviewType)) {
      console.log(`Deadline passed for ${reviewType} - overriding non-pending status to 'none'`);
      return 'none';
    }
    
    if (statuses.includes('approved')) {
      console.log(`Team ${reviewType} status: approved`);
      return 'approved';
    }
    
    console.log(`Team ${reviewType} status: none`);
    return 'none';
  };

  const handleReviewSubmit = async (teamId, reviewType, reviewData, pptObj) => {
    try {
      const team = teams.find(t => t.id === teamId);
      if (!team) return;

      console.log('=== GUIDE REVIEW SUBMIT STARTED ===');
      console.log('Team ID:', teamId);
      console.log('Review type:', reviewType);
      console.log('PPT Object received:', pptObj);

      const studentUpdates = team.students.map(student => {
        const studentReviewData = reviewData[student.regNo] || {};
        
        const updateData = {
          studentId: student._id,
          comments: studentReviewData.comments
        };

        if (reviewType === 'review0') {
          updateData.review0 = {
            component1: studentReviewData.component1 || null,
            locked: studentReviewData.locked || false
          };
        } else if (reviewType === 'draftReview') {
          updateData.draftReview = {
            component1: studentReviewData.component1 || null,
            component2: studentReviewData.component2 || null,
            component3: studentReviewData.component3 || null,
            locked: studentReviewData.locked || false
          };
        } else if (reviewType === 'review1') {
          updateData.review1 = {
            component1: studentReviewData.component1 || null,
            component2: studentReviewData.component2 || null,
            component3: studentReviewData.component3 || null,
            locked: studentReviewData.locked || false
          };
          if (studentReviewData.attendance) {
            updateData.attendance = studentReviewData.attendance;
          }
          if (pptObj && pptObj.pptApproved) {
            updateData.pptApproved = pptObj.pptApproved;
          }
        }

        return updateData;
      });

      const updatePayload = {
        projectId: teamId,
        studentUpdates
      };

      if (reviewType === 'review1' && pptObj) {
        updatePayload.pptApproved = pptObj.pptApproved;
      }

      const response = await updateProject(updatePayload);
      
      if (response.data) {
        setTimeout(async () => {
          await fetchData();
          alert('Guide review submitted successfully!');
        }, 1000);
      }
    } catch (error) {
      console.error('Error submitting guide review:', error);
      alert('Error submitting guide review. Please try again.');
    }
  };

  const handleRequestEdit = async (teamId, reviewType) => {
    try {
      const team = teams.find(t => t.id === teamId);
      if (!team) return;
      
      const reason = prompt('Please enter the reason for requesting edit access:', 'Need to correct marks after deadline');
      if (!reason?.trim()) return;
      
      const currentUser = JSON.parse(localStorage.getItem('faculty') || '{}');
      
      const requestData = {
        employeeId: currentUser.employeeId || 'CURRENT_USER',
        regNo: team.students[0].regNo,
        reviewType: reviewType,
        reason: reason.trim()
      };
      
      const response = await createReviewRequest('guide', requestData);
      
      if (response.success) {
        alert('Edit request submitted successfully!');
        const statuses = await checkAllRequestStatuses(teams);
        setRequestStatuses(statuses);
      } else {
        alert(response.message || 'Error submitting request');
      }
    } catch (error) {
      console.error('Error submitting guide request:', error);
      alert('Error submitting guide request. Please try again.');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar userType="faculty" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar userType="faculty" />
      <div className='min-h-screen bg-gray-50 overflow-x-hidden'>
        <div className='p-24 items-center'>
          <div className="bg-white shadow-md rounded-md">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-black pl-5 mt-2">Guide</h2>
            </div>
            
            {teams.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No projects assigned as guide
              </div>
            ) : (
              teams.map(team => (
                <div key={team.id} className="bg-white rounded-lg shadow-sm mb-4">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
                            className="flex items-center"
                          >
                            <span className={`inline-block transition-transform duration-200 ${
                              expandedTeam === team.id ? 'rotate-90' : ''
                            }`}>
                              <ChevronRight />
                            </span>
                            <span className="font-medium text-black">{team.title}</span>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 ml-6">{team.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActivePopup({ type: 'review0', teamId: team.id })}
                          className="px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                        >
                          Review 0
                        </button>
                        <button
                          onClick={() => setActivePopup({ type: 'draftReview', teamId: team.id })}
                          className="px-4 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors"
                        >
                          Draft Review
                        </button>
                        <button
                          onClick={() => setActivePopup({ type: 'review1', teamId: team.id })}
                          className="px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                        >
                          Guide Review
                        </button>
                      </div>
                    </div>
                    {expandedTeam === team.id && (
                      <ReviewTable 
                        team={team} 
                        deadlines={deadlines}
                        requestStatuses={requestStatuses}
                        isDeadlinePassed={isDeadlinePassed}
                        isReviewLocked={isReviewLocked}
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {activePopup?.type === 'review0' && (
            <PopupReview
              title="Review 0"
              teamMembers={teams.find(t => t.id === activePopup.teamId).students}
              reviewType="review0"
              isOpen={true}
              locked={teams.find(t => t.id === activePopup.teamId).students.some(student => 
                isReviewLocked(student, 'review0')
              )}
              onClose={() => setActivePopup(null)}
              onSubmit={(data) => {
                handleReviewSubmit(activePopup.teamId, 'review0', data);
                setActivePopup(null);
              }}
              onRequestEdit={() => handleRequestEdit(activePopup.teamId, 'review0')}
              requestEditVisible={(() => {
                const team = teams.find(t => t.id === activePopup.teamId);
                const isLocked = team.students.some(student => isReviewLocked(student, 'review0'));
                const requestStatus = getTeamRequestStatus(team, 'review0');
                return isLocked && requestStatus === 'none';
              })()}
              requestPending={getTeamRequestStatus(teams.find(t => t.id === activePopup.teamId), 'review0') === 'pending'}
            />
          )}

          {activePopup?.type === 'draftReview' && (
            <PopupReview
              title="Draft Review"
              teamMembers={teams.find(t => t.id === activePopup.teamId).students}
              reviewType="draftReview"
              isOpen={true}
              locked={teams.find(t => t.id === activePopup.teamId).students.some(student => 
                isReviewLocked(student, 'draftReview')
              )}
              onClose={() => setActivePopup(null)}
              onSubmit={(data) => {
                handleReviewSubmit(activePopup.teamId, 'draftReview', data);
                setActivePopup(null);
              }}
              onRequestEdit={() => handleRequestEdit(activePopup.teamId, 'draftReview')}
              requestEditVisible={(() => {
                const team = teams.find(t => t.id === activePopup.teamId);
                const isLocked = team.students.some(student => isReviewLocked(student, 'draftReview'));
                const requestStatus = getTeamRequestStatus(team, 'draftReview');
                return isLocked && requestStatus === 'none';
              })()}
              requestPending={getTeamRequestStatus(teams.find(t => t.id === activePopup.teamId), 'draftReview') === 'pending'}
            />
          )}

          {activePopup?.type === 'review1' && (
            <PopupReview
              title="Guide Review"
              teamMembers={teams.find(t => t.id === activePopup.teamId).students}
              reviewType="review1"
              pptApproved={{
                approved: (() => {
                  const team = teams.find(t => t.id === activePopup.teamId);
                  return team.students.length > 0 && 
                    team.students.every(student => student.pptApproved?.approved === true);
                })(),
                locked: false
              }}
              isOpen={true}
              locked={teams.find(t => t.id === activePopup.teamId).students.some(student => 
                isReviewLocked(student, 'review1')
              )}
              onClose={() => setActivePopup(null)}
              onSubmit={(data, pptObj) => {
                handleReviewSubmit(activePopup.teamId, 'review1', data, pptObj);
                setActivePopup(null);
              }}
              onRequestEdit={() => handleRequestEdit(activePopup.teamId, 'review1')}
              requestEditVisible={(() => {
                const team = teams.find(t => t.id === activePopup.teamId);
                const isLocked = team.students.some(student => isReviewLocked(student, 'review1'));
                const requestStatus = getTeamRequestStatus(team, 'review1');
                return isLocked && requestStatus === 'none';
              })()}
              requestPending={getTeamRequestStatus(teams.find(t => t.id === activePopup.teamId), 'review1') === 'pending'}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Guide;
