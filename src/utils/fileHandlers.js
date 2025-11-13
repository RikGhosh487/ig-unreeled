// Validate if a JSON object is a raw Instagram message file
const isInstagramMessageFile = (data) => {
  return (
    data &&
    typeof data === "object" &&
    Array.isArray(data.participants) &&
    Array.isArray(data.messages) &&
    typeof data.title === "string" &&
    data.participants.length > 0 &&
    data.participants.every((p) => p.name) &&
    data.messages.every((m) => m.sender_name && m.timestamp_ms)
  );
};

// Validate if a JSON object is a processed stats file
const isProcessedStatsFile = (data) => {
  return (
    data &&
    typeof data === "object" &&
    typeof data.total_messages === "number" &&
    data.per_sender &&
    typeof data.per_sender === "object"
  );
};

// Check if all Instagram message files have the same participants and title
const validateSameConversation = (instagramFiles) => {
  if (instagramFiles.length <= 1) return true;

  const firstFile = instagramFiles[0].data;
  const firstFileParticipants = firstFile.participants
    .map((p) => p.name)
    .sort();
  const firstFileTitle = firstFile.title;

  for (let i = 1; i < instagramFiles.length; i++) {
    const currentFile = instagramFiles[i].data;
    const currentFileParticipants = currentFile.participants
      .map((p) => p.name)
      .sort();
    const currentFileTitle = currentFile.title;

    // Check if titles match
    if (firstFileTitle !== currentFileTitle) {
      return {
        valid: false,
        reason: "title_mismatch",
        expected: firstFileTitle,
        found: currentFileTitle,
        file: instagramFiles[i].filename,
      };
    }

    // Check if participant count matches
    if (firstFileParticipants.length !== currentFileParticipants.length) {
      return {
        valid: false,
        reason: "participant_count_mismatch",
        expectedCount: firstFileParticipants.length,
        foundCount: currentFileParticipants.length,
        file: instagramFiles[i].filename,
      };
    }

    // Check if all participant names match
    for (let j = 0; j < firstFileParticipants.length; j++) {
      if (firstFileParticipants[j] !== currentFileParticipants[j]) {
        return {
          valid: false,
          reason: "participant_name_mismatch",
          expected: firstFileParticipants,
          found: currentFileParticipants,
          file: instagramFiles[i].filename,
        };
      }
    }
  }

  return { valid: true };
};

// Read and parse a single file
const readFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve({ filename: file.name, data });
      } catch (err) {
        reject(new Error(`Invalid JSON in file "${file.name}"`));
      }
    };
    reader.onerror = () =>
      reject(new Error(`Failed to read file "${file.name}"`));
    reader.readAsText(file);
  });
};

// Process multiple files
export const parseMultipleFiles = async (
  files,
  onSuccess,
  onError,
  onProgress = null
) => {
  if (!files || files.length === 0) {
    onError("Please select at least one JSON file");
    return;
  }

  // Validate file types
  const invalidFiles = Array.from(files).filter(
    (file) =>
      !file.name.endsWith(".json") || file.type !== "application/json"
  );

  if (invalidFiles.length > 0) {
    onError(
      `Invalid file types: ${invalidFiles
        .map((f) => f.name)
        .join(", ")}. Please upload only JSON files.`
    );
    return;
  }

  try {
    onProgress && onProgress("Reading files...");

    // Read all files
    const fileResults = await Promise.all(
      Array.from(files).map((file) => readFile(file))
    );

    onProgress && onProgress("Validating file formats...");

    // Check if all files are Instagram message files
    const instagramFiles = fileResults.filter((result) =>
      isInstagramMessageFile(result.data)
    );
    const processedFiles = fileResults.filter((result) =>
      isProcessedStatsFile(result.data)
    );
    const unknownFiles = fileResults.filter(
      (result) =>
        !isInstagramMessageFile(result.data) &&
        !isProcessedStatsFile(result.data)
    );

    if (unknownFiles.length > 0) {
      onError(
        `Unrecognized file format in: ${unknownFiles
          .map((f) => f.filename)
          .join(
            ", "
          )}. Please upload Instagram message files or processed stats JSON.`
      );
      return;
    }

    // Can't mix file types
    if (instagramFiles.length > 0 && processedFiles.length > 0) {
      onError(
        "Cannot mix raw Instagram files and processed stats files. " +
          "Please upload only one type."
      );
      return;
    }

    // Handle processed stats file (should be only one)
    if (processedFiles.length > 0) {
      if (processedFiles.length > 1) {
        onError(
          "Multiple processed stats files detected. " +
            "Please upload only one processed stats file."
        );
        return;
      }
      onSuccess(processedFiles[0].data);
      return;
    }

    // Handle Instagram message files
    if (instagramFiles.length > 0) {
      onProgress && onProgress("Validating conversation consistency...");

      // Validate that all Instagram files are from the same conversation
      const validationResult = validateSameConversation(instagramFiles);
      if (!validationResult.valid) {
        let errorMessage = "Files appear to be from different conversations. ";
        
        switch (validationResult.reason) {
          case "title_mismatch":
            errorMessage += 
              `Chat titles don't match. Expected: "${validationResult.expected}" ` +
              `but found: "${validationResult.found}" in file ` +
              `"${validationResult.file}". `;
            break;
          case "participant_count_mismatch":
            errorMessage += 
              `Different number of participants. Expected: ` +
              `${validationResult.expectedCount} people, but found: ` +
              `${validationResult.foundCount} people in file ` +
              `"${validationResult.file}". `;
            break;
          case "participant_name_mismatch":
            errorMessage += 
              `Different participants. Expected: ` +
              `${validationResult.expected.join(", ")}, but found: ` +
              `${validationResult.found.join(", ")} in file ` +
              `"${validationResult.file}". `;
            break;
        }
        
        errorMessage += 
          "Please ensure all uploaded files are from the same conversation.";
        
        onError(errorMessage);
        return;
      }

      onProgress && onProgress("Processing Instagram data...");

      // For now, we'll just pass the raw files to be processed
      // In the next step, we'll implement the actual processing logic
      const combinedData = {
        type: "raw_instagram",
        files: instagramFiles,
        fileCount: instagramFiles.length,
      };

      onSuccess(combinedData);
      return;
    }

    onError(
      "No valid files found. Please upload Instagram message files or " +
        "a processed stats JSON file."
    );
  } catch (error) {
    onError(`Error processing files: ${error.message}`);
  }
};

// Legacy single file parser for backward compatibility
export const parseStatsFile = (file, onSuccess, onError) => {
  parseMultipleFiles([file], onSuccess, onError);
};

export const handleFileUpload = (
  event,
  onSuccess,
  onError,
  onProgress = null
) => {
  const files = event.target.files;
  parseMultipleFiles(files, onSuccess, onError, onProgress);
};

export const handleFileDrop = (
  event,
  onSuccess,
  onError,
  onProgress = null
) => {
  event.preventDefault();
  const files = event.dataTransfer.files;
  parseMultipleFiles(files, onSuccess, onError, onProgress);
};

export const handleDragOver = (event) => {
  event.preventDefault();
};