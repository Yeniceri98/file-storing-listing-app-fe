import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Trash } from 'react-bootstrap-icons';

const allowedExtensions = ['png', 'jpeg', 'jpg', 'docx', 'pdf', 'xlsx'];

function App() {
	const [files, setFiles] = useState([]);
	const [selectedFile, setSelectedFile] = useState(null);
	const [isDuplicateFile, setIsDuplicateFile] = useState(false);

	useEffect(() => {
		fetchFiles();
	}, []);

	const fetchFiles = () => {
		axios
			.get('http://localhost:8080/api/files/list')
			.then((res) => {
				setFiles(res.data);
				console.log(res.data);
			})
			.catch((err) => {
				console.log('Error has occurred when fetching files', err);
			});
	};

	const deleteFileHandler = (fileId) => {
		axios
			.delete(`http://localhost:8080/api/files/delete/${fileId}`)
			.then((response) => {
				if (response.status === 204) {
					console.log('Deleting file is successful');
					fetchFiles();
				}
			})
			.catch((error) => {
				console.log('Error has occured when deleting file:', error);
			});
	};

	const chooseFileHandler = (e) => {
		setSelectedFile(e.target.files[0]);
	};

	const uploadFileHandler = () => {
		if (selectedFile) {
			const isDuplicate = files.some((file) => file.fileName === selectedFile.name);

			const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

			if (!allowedExtensions.includes(fileExtension)) {
				alert(
					`File with '${fileExtension}' extension is not allowed. \nPlease choose a file with one of the following extensions: \n${allowedExtensions.join(
						', '
					)}`
				);
				return;
			}

			if (isDuplicate) {
				setIsDuplicateFile(true);
			} else {
				setIsDuplicateFile(false);
			}

			const formData = new FormData();
			formData.append('file', selectedFile);

			axios
				.post('http://localhost:8080/api/files/upload', formData)
				.then((response) => {
					console.log('File uploaded successfully:', response.data);
					fetchFiles();
				})
				.catch((error) => {
					console.error('Error has occured when uploading a file :', error);
				});
		}
	};

	const bytesToMB = (bytes) => {
		return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
	};

	return (
		<div className="container">
			<h3 className="title">File Tracker Table</h3>
			{files.length === 0 ? (
				<h2>There is no data!!!</h2>
			) : (
				<>
					<Table striped bordered hover responsive="lg" variant="dark">
						<thead>
							<tr>
								<th>ID</th>
								<th>Name</th>
								<th>Path</th>
								<th>Size</th>
								<th>Operation</th>
							</tr>
						</thead>
						<tbody>
							{files.map((file) => (
								<tr key={file.id}>
									<td>{file.id}</td>
									<td>{file.fileName}</td>
									<td>{file.filePath}</td>
									<td>{bytesToMB(file.fileSize)}</td>
									<td className="delete-file-container">
										<Button variant="danger" onClick={() => deleteFileHandler(file.id)}>
											Delete File <Trash />
										</Button>
									</td>
								</tr>
							))}
						</tbody>
					</Table>
				</>
			)}

			<div className="upload-file-container">
				<input type="file" className="fileInput" onChange={chooseFileHandler} />
				<Button variant="primary" onClick={uploadFileHandler}>
					Upload File
				</Button>
			</div>
			{isDuplicateFile && (
				<h4>
					{isDuplicateFile && (
						<p className="error-message">
							Duplicate file! Please choose a different file...
						</p>
					)}
				</h4>
			)}
			<div className="swagger-link">
				<a href="http://localhost:8080/swagger-ui/index.html">
					Visit Swagger Documentation
				</a>
			</div>
		</div>
	);
}

export default App;
