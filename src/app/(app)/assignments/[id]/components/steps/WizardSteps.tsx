'use client'
import * as React from 'react'
import Link from 'next/link'
import {motion, AnimatePresence} from 'framer-motion'
import {Upload, CheckCircle2, Trash2, Plus, ChevronDown, ChevronUp, Settings} from 'lucide-react'
import {BeatLoading} from 'respinner'
import {LoadingSpinner} from '@/components/ui/LoadingSpinner'
import {EmptyState} from '@/components/ui/EmptyState'
import {StatusBadge} from '@/components/ui/StatusBadge'
import {Table} from '@/components/ui/Table'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {cn} from '@/lib/utils'
import {useAssignmentWizard} from '../../context'

/** Animated grading indicator shown while a score is not yet available. */
function GradingPlaceholderProgress() {
  return (
    <div className="mt-1.5 flex min-h-[18px] items-center" aria-hidden="true">
      <BeatLoading width={28} count={4} gap={3} duration={0.9} color="#f97316" className="block" />
    </div>
  )
}

export function Step1() {
  const {
    assignmentId,
    assignment,
    setAssignment,
    questions,
    setQuestions,
    loading,
    setLoading,
    error,
    setError,
    currentStep,
    setCurrentStep,
    direction,
    setDirection,
    sqlFile,
    setSqlFile,
    givenZipFile,
    setGivenZipFile,
    givenApiBaseUrl,
    setGivenApiBaseUrl,
    savingSetup,
    setSavingSetup,
    setupMessage,
    setSetupMessage,
    handleSaveSetup,
    handleTriggerGrading,
    showCreateQuestion,
    setShowCreateQuestion,
    questionsFormList,
    setQuestionsFormList,
    confirmOpen,
    setConfirmOpen,
    confirmConfig,
    openConfirm,
    creatingQuestion,
    setCreatingQuestion,
    handleCreateQuestion,
    handleDeleteQuestion,
    handleAddFormRow,
    handleRemoveFormRow,
    handleUpdateFormRow,
    tcDialogConfig,
    setTcDialogConfig,
    tcDialogSaving,
    tcDetailDialog,
    setTcDetailDialog,
    handleSaveTestCases,
    expandedQuestions,
    handleToggleDetail,
    questionTestCases,
    setQuestionTestCases,
    loadingTestCases,
    submissions,
    setSubmissions,
    loadingSubmissions,
    triggering,
    handleDeleteSubmission,
    handleTriggerGradingForSubmission,
    handleDeleteTestCaseInline,
    exportJob,
    exporting,
    exportError,
    gradingRound,
    setGradingRound,
    handleCreateExport,
    handleDownloadExport,
    participants,
    setParticipants,
    bulkFile,
    setBulkFile,
    bulkResult,
    setBulkResult,
    importFile,
    setImportFile,
    importResult,
    setImportResult,
    uploading,
    showUploadForm,
    setShowUploadForm,
    handleBulkUpload,
    handleImportParticipants,
    hasParticipants,
    hasResources,
    hasQuestions,
    loadAssignment,
    loadParticipants,
    loadQuestions,
    loadSubmissions,
  } = useAssignmentWizard()

  if (currentStep !== 1) return null

  return (
    <div className="w-full flex flex-col py-4">
      {!hasParticipants || showUploadForm ? (
        <>
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-[#222222] mb-3 tracking-tight">
              Upload Student List
            </h2>
            <p className="text-sm text-[#717171] leading-relaxed">
              First step: Attach a CSV file containing the list of students participating in the
              exam. The file format requires a header and two columns:{' '}
              <strong className="text-[#222222] font-semibold">username, studentCode</strong>.
            </p>
          </div>

          <div className="bg-[#fcfcfc] border border-dashed border-[#dddddd] rounded-2xl p-10 text-center mb-8 flex flex-col items-center justify-center transition-all hover:border-[#f97316]/40">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#222222] mb-4 shadow-sm border border-[#ebebeb]">
              <Upload size={20} className="stroke-[1.5]" />
            </div>
            <h3 className="text-base font-semibold text-[#222222] mb-1">
              {uploading
                ? 'Processing...'
                : importFile
                  ? importFile.name
                  : 'Drag & drop or browse CSV file'}
            </h3>
            <p className="text-xs text-[#717171] mb-6">
              {importFile
                ? `Size: ${(importFile.size / 1024).toFixed(1)} KB`
                : 'Supported format: .csv up to 10MB'}
            </p>

            <label className="inline-flex items-center justify-center px-5 py-2.5 bg-white border border-[#dddddd] rounded-xl text-sm font-semibold text-[#222222] hover:border-[#f97316] hover:bg-[#fff7ed] hover:text-[#ea580c] transition-all cursor-pointer select-none active:scale-[0.98]">
              Select file...
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setImportFile(file)
                    handleImportParticipants(file)
                  } else {
                    setImportFile(null)
                  }
                }}
                className="hidden"
              />
            </label>
          </div>

          {importResult && (
            <div className="p-4 bg-[#fff7ed] border border-[#ffedd5] rounded-2xl flex items-start gap-3 mb-8">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 stroke-[1.5]" />
              <div>
                <h4 className="text-sm font-semibold text-[#ea580c]">System Notification</h4>
                <p className="text-xs text-[#717171] mt-0.5">{importResult}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            {hasParticipants && !uploading && (
              <button
                onClick={() => {
                  setShowUploadForm(false)
                  setImportFile(null)
                  setImportResult(null)
                }}
                className="inline-flex items-center justify-center px-5 py-3 bg-white border border-[#dddddd] text-[#222222] rounded-xl text-sm font-semibold hover:border-red-500 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer active:scale-[0.98]"
              >
                Cancel
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="w-full flex flex-col py-4">
          <div className="flex justify-between items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-[#222222] tracking-tight">
                Existing Student List ({participants.length})
              </h2>
              <p className="text-xs text-[#717171] mt-1 leading-relaxed">
                The system has detected the student list. You can proceed to the next step or upload
                a new file.
              </p>
            </div>
            <button
              onClick={() => setShowUploadForm(true)}
              className="inline-flex items-center justify-center px-4 py-2.5 border border-[#f97316] text-[#f97316] bg-white rounded-full text-xs font-semibold hover:bg-[#fff7ed] hover:text-[#ea580c] transition-all cursor-pointer active:scale-95 select-none shrink-0"
            >
              Upload another CSV file
            </button>
          </div>

          <div className="border border-[#ebebeb] rounded-2xl overflow-hidden bg-white">
            <div className="w-full">
              <Table
                maxHeight={600}
                columns={[
                  {
                    key: 'studentCode',
                    header: 'Student Code',
                    render: (p: any) => (
                      <span className="font-semibold text-[#222222]">{p.studentCode}</span>
                    ),
                  },
                  {
                    key: 'username',
                    header: 'Username',
                    render: (p: any) => <span className="text-[#717171]">{p.username}</span>,
                  },
                ]}
                data={participants}
                keyExtractor={(p: any) => p.id}
                emptyMessage="No students in the list."
                borderless={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function Step2() {
  const {
    assignmentId,
    assignment,
    setAssignment,
    questions,
    setQuestions,
    loading,
    setLoading,
    error,
    setError,
    currentStep,
    setCurrentStep,
    direction,
    setDirection,
    sqlFile,
    setSqlFile,
    givenZipFile,
    setGivenZipFile,
    givenApiBaseUrl,
    setGivenApiBaseUrl,
    savingSetup,
    setSavingSetup,
    setupMessage,
    setSetupMessage,
    handleSaveSetup,
    handleTriggerGrading,
    showCreateQuestion,
    setShowCreateQuestion,
    questionsFormList,
    setQuestionsFormList,
    confirmOpen,
    setConfirmOpen,
    confirmConfig,
    openConfirm,
    creatingQuestion,
    setCreatingQuestion,
    handleCreateQuestion,
    handleDeleteQuestion,
    handleAddFormRow,
    handleRemoveFormRow,
    handleUpdateFormRow,
    tcDialogConfig,
    setTcDialogConfig,
    tcDialogSaving,
    tcDetailDialog,
    setTcDetailDialog,
    handleSaveTestCases,
    expandedQuestions,
    handleToggleDetail,
    questionTestCases,
    setQuestionTestCases,
    loadingTestCases,
    submissions,
    setSubmissions,
    loadingSubmissions,
    triggering,
    handleDeleteSubmission,
    handleTriggerGradingForSubmission,
    handleDeleteTestCaseInline,
    exportJob,
    exporting,
    exportError,
    gradingRound,
    setGradingRound,
    handleCreateExport,
    handleDownloadExport,
    participants,
    setParticipants,
    bulkFile,
    setBulkFile,
    bulkResult,
    setBulkResult,
    importFile,
    setImportFile,
    importResult,
    setImportResult,
    uploading,
    showUploadForm,
    setShowUploadForm,
    handleBulkUpload,
    handleImportParticipants,
    hasParticipants,
    hasResources,
    hasQuestions,
    loadAssignment,
    loadParticipants,
    loadQuestions,
    loadSubmissions,
  } = useAssignmentWizard()

  if (currentStep !== 2) return null

  return (
    <div className="w-full flex flex-col py-4">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-[#222222] mb-3 tracking-tight">
          Set Up Exam Resources
        </h2>
        <p className="text-sm text-[#717171] leading-relaxed">
          Attach the necessary resources for the assignment, such as SQL database files, API Base
          URL, or initial source code (ZIP) for the automated grading system.
        </p>
      </div>

      {setupMessage && (
        <div
          className={`p-4 rounded-2xl flex items-start gap-3 mb-6 border ${
            setupMessage.includes('success')
              ? 'bg-[#fff7ed] border-[#ffedd5] text-[#ea580c]'
              : 'bg-red-50 border-red-100 text-red-800'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 stroke-[1.5]" />
          <div>
            <h4 className="text-sm font-semibold">System Notification</h4>
            <p className="text-xs text-[#717171] mt-0.5">{setupMessage}</p>
          </div>
        </div>
      )}

      {/* Khung 3 cột cấu hình tài nguyên tích hợp trạng thái bên trong tiêu đề */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Upload SQL */}
        <div className="p-6 border border-[#ebebeb] rounded-2xl bg-white flex flex-col justify-between gap-4 min-h-[180px]">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[#222222]">Database (.sql)</h3>
              <div
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 select-none shrink-0 ${
                  assignment.databaseSqlPath
                    ? 'bg-[#fff7ed] text-[#ea580c] border-[#ffedd5]'
                    : 'bg-[#f5f5f5] text-[#717171] border-[#e5e5e5]'
                }`}
              >
                {assignment.databaseSqlPath ? (
                  <>
                    <span className="w-1 h-1 rounded-full bg-emerald-600 animate-pulse" />
                    Attached
                  </>
                ) : (
                  'Not configured'
                )}
              </div>
            </div>
            <p className="text-[11px] text-[#717171] leading-relaxed">
              Provide SQL structure and sample data to initialize the grading environment for the
              assignment.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex-1 flex items-center justify-between px-4 py-3 border border-[#dddddd] rounded-xl bg-[#fcfcfc] cursor-pointer hover:border-[#f97316]/30 transition-all select-none">
              <span className="text-xs text-[#717171] font-medium truncate max-w-[280px]">
                {sqlFile ? sqlFile.name : 'Select SQL file...'}
              </span>
              <Upload size={14} className="text-[#717171] stroke-[1.5]" />
              <input
                type="file"
                accept=".sql"
                onChange={(e) => setSqlFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
            {sqlFile && (
              <button
                onClick={() => setSqlFile(null)}
                className="text-xs text-red-500 hover:text-red-700 font-semibold active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Given API ZIP */}
        <div className="p-6 border border-[#ebebeb] rounded-2xl bg-white flex flex-col justify-between gap-4 min-h-[180px]">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[#222222]">Given API (.zip)</h3>
              <div
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 select-none shrink-0 ${
                  assignment.hasGivenZip
                    ? 'bg-[#fff7ed] text-[#ea580c] border-[#ffedd5]'
                    : 'bg-[#f5f5f5] text-[#717171] border-[#e5e5e5]'
                }`}
              >
                {assignment.hasGivenZip ? (
                  <>
                    <span className="w-1 h-1 rounded-full bg-emerald-600 animate-pulse" />
                    Attached
                  </>
                ) : (
                  'Not configured'
                )}
              </div>
            </div>
            <p className="text-[11px] text-[#717171] leading-relaxed">
              The ZIP source code of the Given API will be extracted by the system and the mock
              service will be automatically activated.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex-1 flex items-center justify-between px-4 py-3 border border-[#dddddd] rounded-xl bg-[#fcfcfc] cursor-pointer hover:border-[#f97316]/30 transition-all select-none">
              <span className="text-xs text-[#717171] font-medium truncate max-w-[280px]">
                {givenZipFile ? givenZipFile.name : 'Select ZIP file...'}
              </span>
              <Upload size={14} className="text-[#717171] stroke-[1.5]" />
              <input
                type="file"
                accept=".zip"
                onChange={(e) => setGivenZipFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
            {givenZipFile && (
              <button
                onClick={() => setGivenZipFile(null)}
                className="text-xs text-red-500 hover:text-red-700 font-semibold active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* API URL */}
        <div className="p-6 border border-[#ebebeb] rounded-2xl bg-white flex flex-col justify-between gap-4 min-h-[180px]">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[#222222]">Given API Base URL</h3>
              <div
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 select-none shrink-0 ${
                  assignment.givenApiBaseUrl
                    ? 'bg-[#fff7ed] text-[#ea580c] border-[#ffedd5]'
                    : 'bg-[#f5f5f5] text-[#717171] border-[#e5e5e5]'
                }`}
              >
                {assignment.givenApiBaseUrl ? (
                  <>
                    <span className="w-1 h-1 rounded-full bg-emerald-600 animate-pulse" />
                    Set
                  </>
                ) : (
                  'Not configured'
                )}
              </div>
            </div>
            <p className="text-[11px] text-[#717171] leading-relaxed">
              Alternative API path in case you use an externally deployed API Endpoint.
            </p>
          </div>
          <input
            type="text"
            value={givenApiBaseUrl}
            onChange={(e) => setGivenApiBaseUrl(e.target.value)}
            placeholder="e.g. https://api.example.com"
            className="w-full bg-white border border-[#dddddd] rounded-xl px-4 py-3 text-sm text-[#222222] outline-none transition-all focus:border-[#f97316]"
          />
        </div>
      </div>
    </div>
  )
}

export function Step3() {
  const {
    assignmentId,
    assignment,
    setAssignment,
    questions,
    setQuestions,
    loading,
    setLoading,
    error,
    setError,
    currentStep,
    setCurrentStep,
    direction,
    setDirection,
    sqlFile,
    setSqlFile,
    givenZipFile,
    setGivenZipFile,
    givenApiBaseUrl,
    setGivenApiBaseUrl,
    savingSetup,
    setSavingSetup,
    setupMessage,
    setSetupMessage,
    handleSaveSetup,
    handleTriggerGrading,
    showCreateQuestion,
    setShowCreateQuestion,
    questionsFormList,
    setQuestionsFormList,
    confirmOpen,
    setConfirmOpen,
    confirmConfig,
    openConfirm,
    creatingQuestion,
    setCreatingQuestion,
    handleCreateQuestion,
    handleDeleteQuestion,
    handleAddFormRow,
    handleRemoveFormRow,
    handleUpdateFormRow,
    tcDialogConfig,
    setTcDialogConfig,
    tcDialogSaving,
    tcDetailDialog,
    setTcDetailDialog,
    handleSaveTestCases,
    expandedQuestions,
    handleToggleDetail,
    questionTestCases,
    setQuestionTestCases,
    loadingTestCases,
    submissions,
    setSubmissions,
    loadingSubmissions,
    triggering,
    handleDeleteSubmission,
    handleTriggerGradingForSubmission,
    handleDeleteTestCaseInline,
    exportJob,
    exporting,
    exportError,
    gradingRound,
    setGradingRound,
    handleCreateExport,
    handleDownloadExport,
    participants,
    setParticipants,
    bulkFile,
    setBulkFile,
    bulkResult,
    setBulkResult,
    importFile,
    setImportFile,
    importResult,
    setImportResult,
    uploading,
    showUploadForm,
    setShowUploadForm,
    handleBulkUpload,
    handleImportParticipants,
    hasParticipants,
    hasResources,
    hasQuestions,
    loadAssignment,
    loadParticipants,
    loadQuestions,
    loadSubmissions,
  } = useAssignmentWizard()

  if (currentStep !== 3) return null

  return (
    <div className="w-full flex flex-col py-4">
      {/* Tiêu đề chung cho Step 3 */}
      <div className="mb-8 flex justify-between items-start gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-[#222222] mb-3 tracking-tight">
            Set Up Questions List
          </h2>
          <p className="text-sm text-[#717171] leading-relaxed">
            Declare exam questions corresponding to the exam structure, score weight, and
            application type to help the Worker grade accurately.
          </p>
        </div>
        {questions.length > 0 && !showCreateQuestion && (
          <button
            onClick={() => {
              setShowCreateQuestion(true)
              setQuestionsFormList([
                {
                  id: 'init-1',
                  title: '',
                  type: '0',
                  maxScore: 10,
                  artifactFolderName: '',
                  testCases: [],
                  showTestCasesConfig: false,
                },
              ])
            }}
            className="inline-flex items-center justify-center px-4 py-2.5 border border-[#f97316] text-[#f97316] bg-white rounded-full text-xs font-semibold hover:bg-[#fff7ed] hover:text-[#ea580c] transition-all cursor-pointer active:scale-95 select-none shrink-0"
          >
            Add Question
          </button>
        )}
      </div>

      {/* Trường hợp chưa có câu hỏi nào và không trong trạng thái tạo mới */}
      {questions.length === 0 && !showCreateQuestion ? (
        <EmptyState
          title="No exam questions yet"
          description="Please set up the list of exam questions and test cases to start grading with the Worker."
          action={
            <button
              onClick={() => {
                setShowCreateQuestion(true)
                setQuestionsFormList([
                  {
                    id: 'init-1',
                    title: '',
                    type: '0',
                    maxScore: 10,
                    artifactFolderName: '',
                    testCases: [],
                    showTestCasesConfig: false,
                  },
                ])
              }}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer active:scale-95 shadow-sm shadow-orange-500/15"
            >
              Add the first question
            </button>
          }
        />
      ) : (
        <div className="w-full flex flex-col mb-8">
          {questions.length > 0 && (
            <div className="mb-4">
              <span className="text-xs font-bold text-[#717171] uppercase tracking-wider">
                Current Question List ({questions.length})
              </span>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Danh sách câu hỏi hiện có */}
            <AnimatePresence mode="popLayout">
              {questions.map((q: any) => {
                const isExpanded = !!expandedQuestions[q.id]
                const tcs = questionTestCases[q.id] || []
                const isLoading = !!loadingTestCases[q.id]

                return (
                  <motion.div
                    key={q.id}
                    layout
                    initial={{opacity: 0, y: 15}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, scale: 0.95}}
                    transition={{type: 'spring', stiffness: 300, damping: 26}}
                    className={cn(
                      'border rounded-2xl bg-white hover:border-[#f97316]/50 transition-all shadow-sm shadow-black/5 overflow-hidden',
                      isExpanded ? 'border-[#f97316]' : 'border-[#ebebeb]'
                    )}
                  >
                    <div className="p-5 flex items-center justify-between gap-4 select-none">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-[#fff7ed] border border-[#ffedd5] rounded-md text-[10px] font-semibold text-[#ea580c]">
                            {q.type === 0 ? 'API' : 'Razor'}
                          </span>
                          <h4 className="text-sm font-semibold text-[#222222]">{q.title}</h4>
                        </div>
                        <p className="text-xs text-[#717171]">
                          Test Directory:{' '}
                          <span className="text-[#222222] font-medium">{q.artifactFolderName}</span>{' '}
                          | Max Score:{' '}
                          <span className="text-[#222222] font-medium">{q.maxScore}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleDetail(q.id)}
                          className={cn(
                            'inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer select-none active:scale-95',
                            isExpanded
                              ? 'bg-[#fff7ed] border-[#f97316] text-[#ea580c]'
                              : 'bg-white border-[#dddddd] text-[#222222] hover:border-[#f97316] hover:bg-[#fff7ed] hover:text-[#ea580c]'
                          )}
                        >
                          <span>{isExpanded ? 'Close' : 'Details'}</span>
                          {isExpanded ? (
                            <ChevronUp size={14} className="stroke-[2]" />
                          ) : (
                            <ChevronDown size={14} className="stroke-[2]" />
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-2 text-[#717171] hover:text-[#f97316] hover:bg-[#fff7ed] rounded-full transition-all cursor-pointer active:scale-95"
                          title="Delete question"
                        >
                          <Trash2 size={16} className="stroke-[1.5]" />
                        </button>
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{height: 0, opacity: 0}}
                          animate={{height: 'auto', opacity: 1}}
                          exit={{height: 0, opacity: 0}}
                          transition={{duration: 0.2, ease: 'easeInOut'}}
                          className="border-t border-[#ebebeb] bg-[#fafafa]"
                        >
                          <div className="p-5 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                              <h5 className="text-xs font-bold text-[#222222] uppercase tracking-wider">
                                Test Cases List ({tcs.length})
                              </h5>
                              <Link
                                href={`/assignments/${assignmentId}/questions/${q.id}`}
                                className="text-xs font-semibold text-[#f97316] hover:text-[#ea580c] hover:underline"
                              >
                                Manage Details →
                              </Link>
                            </div>

                            {isLoading ? (
                              <div className="py-6 flex justify-center">
                                <LoadingSpinner label="Loading test cases..." />
                              </div>
                            ) : tcs.length === 0 ? (
                              <div className="py-6 text-center text-xs text-[#717171] border border-dashed border-[#dddddd] bg-white rounded-xl">
                                No test cases configured yet. Please add them using JSON below or go
                                to the detailed management page.
                              </div>
                            ) : (
                              <div className="flex flex-col gap-2">
                                {tcs.map((tc: any, idx: number) => {
                                  const method = tc.httpMethod?.toUpperCase() || 'GET'
                                  let methodBadgeBg = '#f0f9ff'
                                  let methodBadgeColor = '#0369a1'

                                  if (method === 'POST') {
                                    methodBadgeBg = '#f0fdf4'
                                    methodBadgeColor = '#166534'
                                  } else if (method === 'PUT') {
                                    methodBadgeBg = '#fff8f0'
                                    methodBadgeColor = '#c2410c'
                                  } else if (method === 'DELETE') {
                                    methodBadgeBg = '#fef2f2'
                                    methodBadgeColor = '#dc2626'
                                  }

                                  return (
                                    <div
                                      key={tc.id}
                                      onClick={() =>
                                        setTcDetailDialog({isOpen: true, tc: tc, qType: q.type})
                                      }
                                      className="p-3 bg-white border border-[#ebebeb] rounded-xl flex items-center justify-between gap-4 shadow-sm cursor-pointer hover:border-[#f97316] transition-colors group"
                                    >
                                      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                          <span
                                            style={{
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              width: '22px',
                                              height: '22px',
                                              borderRadius: '50%',
                                              backgroundColor: '#eceae3',
                                              fontSize: '0.6875rem',
                                              fontWeight: 700,
                                              color: '#36342e',
                                            }}
                                          >
                                            {idx + 1}
                                          </span>
                                          <span
                                            style={{
                                              display: 'inline-block',
                                              padding: '2px 8px',
                                              borderRadius: '4px',
                                              fontSize: '0.75rem',
                                              fontWeight: 700,
                                              backgroundColor: methodBadgeBg,
                                              color: methodBadgeColor,
                                            }}
                                          >
                                            {method}
                                          </span>
                                          <span
                                            style={{
                                              fontSize: '0.9375rem',
                                              fontWeight: 600,
                                              color: '#201515',
                                            }}
                                            className="truncate"
                                          >
                                            {tc.name}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 pl-[30px] flex-wrap">
                                          <code
                                            style={{
                                              fontSize: '0.8125rem',
                                              color: '#36342e',
                                              backgroundColor: '#eceae3',
                                              padding: '1px 6px',
                                              borderRadius: '3px',
                                            }}
                                            className="truncate max-w-[200px] md:max-w-[400px]"
                                          >
                                            {q.type === 0
                                              ? tc.urlTemplate || '/'
                                              : tc.selector || '-'}
                                          </code>
                                          <span
                                            style={{
                                              fontSize: '0.8125rem',
                                              color: '#939084',
                                            }}
                                          >
                                            {q.type === 0
                                              ? `Status: ${tc.expectedStatus ?? '—'}`
                                              : `Value: ${tc.value ?? '—'}`}{' '}
                                            &middot;{' '}
                                            {tc.order > 0 && (
                                              <>
                                                Order: <strong>{tc.order}</strong> &middot;{' '}
                                              </>
                                            )}
                                            <strong style={{color: '#ff4f00'}}>
                                              {tc.score} pts
                                            </strong>
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center shrink-0">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteTestCaseInline(q.id, tc.id)
                                          }}
                                          className="p-2 text-[#717171] hover:text-red-500 hover:bg-red-50 rounded-full transition-all cursor-pointer active:scale-95 opacity-0 group-hover:opacity-100"
                                          title="Delete this Test Case"
                                        >
                                          <Trash2 size={16} className="stroke-[1.5]" />
                                        </button>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}

                            {/* Nút mở Dialog thêm nhanh Test Cases */}
                            <div className="mt-4 pt-4 border-t border-[#ebebeb] flex justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  setTcDialogConfig({
                                    isOpen: true,
                                    context: 'existing',
                                    targetId: q.id,
                                    qType: q.type,
                                    initialItems: [],
                                  })
                                }}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#fff7ed] hover:bg-[#ffedd5] text-[#f97316] text-xs font-semibold rounded-xl transition-colors"
                              >
                                <Plus size={14} /> Add New Test Cases
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* Hiển thị các dòng nhập câu hỏi mới inline */}
            {showCreateQuestion && (
              <>
                <div className="mt-6 mb-2">
                  <span className="text-xs font-bold text-[#ea580c] uppercase tracking-wider">
                    Create New Exam Question
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  <AnimatePresence mode="popLayout">
                    {questionsFormList.map((item: any, idx: number) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, scale: 0.95}}
                        transition={{type: 'spring', stiffness: 300, damping: 26}}
                        className="p-5 border border-dashed border-[#f97316]/30 bg-[#fffcf9] rounded-2xl relative flex flex-col gap-4 transition-all duration-200"
                      >
                        {/* Số thứ tự động tiếp nối */}
                        <div className="absolute -left-2.5 -top-2.5 w-6 h-6 rounded-full bg-white border border-[#f97316]/30 text-[#ea580c] text-[10px] font-bold flex items-center justify-center shadow-sm">
                          {questions.length + idx + 1}
                        </div>

                        <div className="grid grid-cols-12 gap-3 items-end">
                          <div className="col-span-12 md:col-span-4 flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">
                              Question Title <span className="text-[#f97316]">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={item.title}
                              onChange={(e) =>
                                handleUpdateFormRow(item.id, 'title', e.target.value)
                              }
                              placeholder="e.g. Question 1"
                              className="w-full bg-white border border-[#dddddd] rounded-lg px-3 py-2 text-sm text-[#222222] outline-none focus:border-[#f97316]"
                            />
                          </div>

                          <div className="col-span-12 md:col-span-2 flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">
                              App Type
                            </label>
                            <Select
                              value={item.type}
                              onValueChange={(val: '0' | '1') =>
                                handleUpdateFormRow(item.id, 'type', val)
                              }
                            >
                              <SelectTrigger className="w-full h-[38px] px-3 py-2 text-sm border-[#dddddd] rounded-lg text-[#222222] focus:ring-0 focus:ring-offset-0 focus:border-[#f97316]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">API</SelectItem>
                                <SelectItem value="1">Razor Page</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="col-span-12 md:col-span-2 flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">
                              Max Score
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={item.maxScore.toString()}
                              onChange={(e) =>
                                handleUpdateFormRow(
                                  item.id,
                                  'maxScore',
                                  e.target.value === '' ? 0 : Number(e.target.value)
                                )
                              }
                              className="w-full bg-white border border-[#dddddd] rounded-lg px-3 py-2 text-sm text-[#222222] outline-none focus:border-[#f97316] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]"
                            />
                          </div>

                          <div className="col-span-12 md:col-span-2 flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">
                              Storage Directory <span className="text-[#f97316]">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={item.artifactFolderName}
                              onChange={(e) =>
                                handleUpdateFormRow(item.id, 'artifactFolderName', e.target.value)
                              }
                              placeholder="e.g. 1"
                              className="w-full bg-white border border-[#dddddd] rounded-lg px-3 py-2 text-sm text-[#222222] outline-none focus:border-[#f97316]"
                            />
                          </div>

                          <div className="col-span-12 md:col-span-2 flex justify-end md:justify-center md:pb-1.5 gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateFormRow(
                                  item.id,
                                  'showTestCasesConfig',
                                  !item.showTestCasesConfig
                                )
                              }
                              className={cn(
                                'p-2 rounded-full transition-all cursor-pointer active:scale-95',
                                item.showTestCasesConfig
                                  ? 'text-[#ea580c] bg-[#fff7ed]'
                                  : 'text-[#717171] hover:text-[#ea580c] hover:bg-[#fff7ed]'
                              )}
                              title="Configure JSON Test Cases"
                            >
                              <Plus
                                size={16}
                                className={cn(
                                  'transition-transform duration-200',
                                  item.showTestCasesConfig && 'rotate-45'
                                )}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveFormRow(item.id)}
                              disabled={questionsFormList.length === 1}
                              className="p-2 text-[#717171] hover:text-red-500 hover:bg-red-50 rounded-full transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                              title="Delete this row"
                            >
                              <Trash2 size={16} className="stroke-[1.5]" />
                            </button>
                          </div>
                        </div>

                        {/* Nút mở Dialog cấu hình Test Cases */}
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setTcDialogConfig({
                                isOpen: true,
                                context: 'new',
                                targetId: item.id,
                                qType: Number(item.type),
                                initialItems: item.testCases,
                              })
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#fff7ed] hover:bg-[#ffedd5] text-[#f97316] text-xs font-semibold rounded-xl transition-colors w-full justify-center border border-[#ffedd5]"
                          >
                            <Settings size={14} />
                            {item.testCases.length > 0
                              ? `Configured ${item.testCases.length} Test Cases (Click to edit)`
                              : 'Configure Test Cases'}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Dòng phân cách và nhóm buttons */}
                <div className="pt-4 border-t border-[#ebebeb] flex justify-between items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAddFormRow}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#f97316] text-[#f97316] bg-white rounded-full text-xs font-semibold hover:bg-[#fff7ed] transition-all cursor-pointer active:scale-95 select-none"
                  >
                    <Plus size={14} className="stroke-[2.5]" />
                    Add new question
                  </button>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateQuestion(false)}
                      className="px-5 py-2.5 bg-white border border-[#dddddd] text-[#222222] text-xs font-semibold rounded-xl hover:bg-[#f7f7f7] transition-all cursor-pointer active:scale-97 select-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCreateQuestion()}
                      disabled={
                        creatingQuestion ||
                        !questionsFormList.some(
                          (q: any) => q.title.trim() && q.artifactFolderName.trim()
                        )
                      }
                      className="px-5 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:bg-[#ebebeb] disabled:text-[#b0b0b0] active:scale-97 select-none"
                    >
                      {creatingQuestion ? 'Creating...' : 'Save Question'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function Step4() {
  const {
    assignmentId,
    assignment,
    setAssignment,
    questions,
    setQuestions,
    loading,
    setLoading,
    error,
    setError,
    currentStep,
    setCurrentStep,
    direction,
    setDirection,
    sqlFile,
    setSqlFile,
    givenZipFile,
    setGivenZipFile,
    givenApiBaseUrl,
    setGivenApiBaseUrl,
    savingSetup,
    setSavingSetup,
    setupMessage,
    setSetupMessage,
    handleSaveSetup,
    handleTriggerGrading,
    showCreateQuestion,
    setShowCreateQuestion,
    questionsFormList,
    setQuestionsFormList,
    confirmOpen,
    setConfirmOpen,
    confirmConfig,
    openConfirm,
    creatingQuestion,
    setCreatingQuestion,
    handleCreateQuestion,
    handleDeleteQuestion,
    handleAddFormRow,
    handleRemoveFormRow,
    handleUpdateFormRow,
    tcDialogConfig,
    setTcDialogConfig,
    tcDialogSaving,
    tcDetailDialog,
    setTcDetailDialog,
    handleSaveTestCases,
    expandedQuestions,
    handleToggleDetail,
    questionTestCases,
    setQuestionTestCases,
    loadingTestCases,
    submissions,
    setSubmissions,
    loadingSubmissions,
    triggering,
    handleDeleteSubmission,
    handleTriggerGradingForSubmission,
    handleDeleteTestCaseInline,
    setSelectedSubmissionId,
    exportJob,
    exporting,
    exportError,
    gradingRound,
    setGradingRound,
    handleCreateExport,
    handleDownloadExport,
    participants,
    setParticipants,
    bulkFile,
    setBulkFile,
    bulkResult,
    setBulkResult,
    importFile,
    setImportFile,
    importResult,
    setImportResult,
    uploading,
    showUploadForm,
    setShowUploadForm,
    handleBulkUpload,
    handleImportParticipants,
    hasParticipants,
    hasResources,
    hasQuestions,
    loadAssignment,
    loadParticipants,
    loadQuestions,
    loadSubmissions,
  } = useAssignmentWizard()

  if (currentStep !== 4) return null

  return (
    <div className="w-full flex flex-col py-4">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#222222] mb-1">
            Upload Submissions & Trigger Grading
          </h2>
          <p className="text-xs text-[#717171]">
            Upload the ZIP file containing student submissions and trigger the Worker to start bulk
            testing.
          </p>
        </div>
      </div>

      <div className="p-4 border border-[#ebebeb] rounded-xl bg-white flex flex-col md:flex-row gap-4 md:items-end shadow-sm mb-6">
        <div className="flex flex-col gap-1.5 flex-1 max-w-[200px]">
          <label className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">
            Grading Round <span className="text-[#f97316]">*</span>
          </label>
          <input
            type="text"
            value={gradingRound}
            onChange={(e) => setGradingRound(e.target.value)}
            placeholder="e.g. Round 1"
            className="w-full bg-[#fcfcfc] border border-[#ebebeb] rounded-lg px-3 py-2 text-sm text-[#222222] outline-none focus:border-[#f97316] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-[10px] font-bold text-[#717171] uppercase tracking-wider">
            1. Submissions ZIP File
          </label>
          <div className="flex items-center gap-2">
            <label className="flex-1 flex items-center justify-between px-3 py-2 border border-[#ebebeb] rounded-lg bg-[#fcfcfc] cursor-pointer hover:border-[#f97316] hover:bg-white transition-all select-none">
              <span className="text-xs text-[#717171] font-medium truncate max-w-[150px] md:max-w-[250px]">
                {uploading ? 'Processing...' : bulkFile ? bulkFile.name : 'Select ZIP file...'}
              </span>
              <Upload size={14} className="text-[#b0b0b0]" />
              <input
                type="file"
                accept=".zip"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setBulkFile(file)
                    handleBulkUpload(file)
                  } else {
                    setBulkFile(null)
                  }
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 shrink-0">
          <label className="text-[10px] font-bold text-[#717171] uppercase tracking-wider hidden md:block opacity-0">
            Action
          </label>
          <button
            onClick={handleTriggerGrading}
            disabled={exporting || !gradingRound.trim()}
            className="h-[38px] px-5 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:bg-[#ebebeb] disabled:text-[#b0b0b0] shadow-sm select-none flex items-center justify-center min-w-[140px]"
          >
            {exporting ? 'Processing...' : 'Trigger Grading'}
          </button>
        </div>
      </div>

      {(bulkResult || exportError) && (
        <div className="flex flex-col gap-2 mb-6 -mt-3">
          {bulkResult && (
            <div className="px-4 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-medium">
              {bulkResult}
            </div>
          )}
          {exportError && (
            <div className="px-4 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium">
              {exportError}
            </div>
          )}
        </div>
      )}

      {/* Submissions List */}
      {loadingSubmissions ? (
        <div className="py-8 flex justify-center">
          <LoadingSpinner label="Loading submissions list..." />
        </div>
      ) : submissions.length === 0 ? (
        <EmptyState
          title="No submissions yet"
          description="The list of student submissions will appear here after you upload the ZIP file."
        />
      ) : (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-[#222222] mb-4">
            Grading Progress & Results ({submissions.length})
          </h3>
          <div className="border border-[#ebebeb] rounded-2xl overflow-hidden bg-white">
            <div className="w-full">
              <Table
                maxHeight={600}
                columns={[
                  {
                    key: 'student',
                    header: 'Student',
                    render: (s: any) => (
                      <div>
                        <div className="font-semibold text-[#222222]">{s.studentCode}</div>
                        <div className="text-[10px] text-[#717171]">{s.username}</div>
                      </div>
                    ),
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (s: any) => <StatusBadge status={s.status} />,
                  },
                  {
                    key: 'score',
                    header: 'Score',
                    render: (s: any) =>
                      s.status === 'Pending' || s.status === 'Grading' ? (
                        <div className="min-w-[100px]">
                          <GradingPlaceholderProgress />
                        </div>
                      ) : s.totalScore !== undefined && s.totalScore !== null ? (
                        <span
                          className={`font-semibold ${
                            (s.totalScore ?? 0) / (s.maxScore ?? 1) >= 0.5
                              ? 'text-emerald-600'
                              : 'text-[#f97316]'
                          }`}
                        >
                          {s.totalScore} / {s.maxScore}
                        </span>
                      ) : (
                        <span className="text-[#717171]">-</span>
                      ),
                  },
                  {
                    key: 'actions',
                    header: '',
                    render: (s: any) => (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedSubmissionId(s.id)}
                          className="px-2.5 py-1.5 bg-white border border-[#dddddd] hover:border-[#f97316] text-[10px] font-semibold text-[#222222] rounded-xl transition-all text-underline-none select-none cursor-pointer hover:bg-[#fff7ed]"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleTriggerGradingForSubmission(s.id)}
                          disabled={triggering === s.id}
                          className="px-2.5 py-1.5 bg-white border border-[#dddddd] hover:border-[#f97316] text-[#222222] text-[10px] font-semibold rounded-xl transition-all cursor-pointer active:scale-95 hover:bg-[#fff7ed]"
                        >
                          {triggering === s.id ? '...' : 'Regrade'}
                        </button>
                        <button
                          onClick={() => handleDeleteSubmission(s.id)}
                          className="p-1.5 text-[#717171] hover:text-[#f97316] hover:bg-[#fff7ed] rounded-full transition-all cursor-pointer active:scale-95"
                        >
                          <Trash2 size={13} className="stroke-[1.5]" />
                        </button>
                      </div>
                    ),
                  },
                ]}
                data={submissions}
                keyExtractor={(s: any) => s.id}
                emptyMessage="No submissions found."
                borderless={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function Step5() {
  const {
    assignmentId,
    assignment,
    setAssignment,
    questions,
    setQuestions,
    loading,
    setLoading,
    error,
    setError,
    currentStep,
    setCurrentStep,
    direction,
    setDirection,
    sqlFile,
    setSqlFile,
    givenZipFile,
    setGivenZipFile,
    givenApiBaseUrl,
    setGivenApiBaseUrl,
    savingSetup,
    setSavingSetup,
    setupMessage,
    setSetupMessage,
    handleSaveSetup,
    handleTriggerGrading,
    showCreateQuestion,
    setShowCreateQuestion,
    questionsFormList,
    setQuestionsFormList,
    confirmOpen,
    setConfirmOpen,
    confirmConfig,
    openConfirm,
    creatingQuestion,
    setCreatingQuestion,
    handleCreateQuestion,
    handleDeleteQuestion,
    handleAddFormRow,
    handleRemoveFormRow,
    handleUpdateFormRow,
    tcDialogConfig,
    setTcDialogConfig,
    tcDialogSaving,
    tcDetailDialog,
    setTcDetailDialog,
    handleSaveTestCases,
    expandedQuestions,
    handleToggleDetail,
    questionTestCases,
    setQuestionTestCases,
    loadingTestCases,
    submissions,
    setSubmissions,
    loadingSubmissions,
    triggering,
    handleDeleteSubmission,
    handleTriggerGradingForSubmission,
    handleDeleteTestCaseInline,
    exportJob,
    exporting,
    exportError,
    gradingRound,
    setGradingRound,
    handleCreateExport,
    handleDownloadExport,
    participants,
    setParticipants,
    bulkFile,
    setBulkFile,
    bulkResult,
    setBulkResult,
    importFile,
    setImportFile,
    importResult,
    setImportResult,
    uploading,
    showUploadForm,
    setShowUploadForm,
    handleBulkUpload,
    handleImportParticipants,
    hasParticipants,
    hasResources,
    hasQuestions,
    loadAssignment,
    loadParticipants,
    loadQuestions,
    loadSubmissions,
  } = useAssignmentWizard()

  if (currentStep !== 5) return null

  return (
    <div className="w-full flex flex-col py-4">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-[#222222] mb-3 tracking-tight">
          Export Excel Gradebook
        </h2>
        <p className="text-sm text-[#717171] leading-relaxed">
          Final step: Export the entire list of graded student scores to a standard Excel
          spreadsheet (.xlsx) for grading submissions.
        </p>
      </div>

      <div className="p-6 border border-[#ebebeb] rounded-2xl bg-[#fcfcfc] flex flex-col gap-6 max-w-lg w-full mb-8">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-[#717171] uppercase tracking-wider">
            Grading Round
          </label>
          <input
            type="text"
            value={gradingRound}
            onChange={(e) => setGradingRound(e.target.value)}
            placeholder="e.g. Round 1"
            className="w-full bg-white border border-[#dddddd] rounded-lg px-4 py-2.5 text-sm text-[#222222] outline-none focus:border-[#f97316]"
          />
        </div>

        {exportError && (
          <div className="p-3 bg-white border border-[#ebebeb] rounded-xl text-xs text-red-600 shadow-sm">
            {exportError}
          </div>
        )}

        {exportJob && (
          <div
            className={`p-5 rounded-2xl border flex flex-col gap-4 bg-white shadow-sm ${
              exportJob.status === 'Done'
                ? 'border-emerald-500'
                : exportJob.status === 'Failed'
                  ? 'border-red-500'
                  : 'border-amber-500'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-[#222222] flex items-center gap-2">
                Job Status: <StatusBadge status={exportJob.status} />
              </span>
              {exportJob.status === 'Done' && (
                <button
                  onClick={handleDownloadExport}
                  className="inline-flex items-center justify-center px-4 py-2 bg-[#f97316] text-white text-xs font-semibold rounded-xl hover:bg-[#ea580c] transition-all cursor-pointer select-none"
                >
                  Download Gradebook
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleCreateExport}
            disabled={exporting}
            className="inline-flex items-center justify-center px-6 py-3 bg-[#f97316] text-white rounded-xl text-sm font-semibold hover:bg-[#ea580c] transition-all cursor-pointer disabled:bg-[#ebebeb] disabled:text-[#b0b0b0] active:scale-97 shadow-sm shadow-orange-500/10"
          >
            {exporting ? 'Preparing Excel export...' : 'Generate Gradebook'}
          </button>
        </div>
      </div>
    </div>
  )
}
