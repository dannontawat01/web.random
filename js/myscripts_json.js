let jsonData = [];

        function showMessage(message, type = 'error') {
            const messageArea = document.getElementById('messageArea');
            messageArea.innerHTML = `<div class="${type}">${message}</div>`;
            setTimeout(() => {
                messageArea.innerHTML = '';
            }, 5000);
        }

        function convertJSONToTable() {
            const input = document.getElementById('jsonInput').value.trim();
            if (!input) {
                showMessage('กรุณาใส่ข้อมูล JSON', 'error');
                return;
            }

            let jsonObjects = [];
            let parseError = false;

            // 1. ลอง parse แบบ JSON array หรือ object ปกติ
            try {
                const arr = JSON.parse(input);
                if (Array.isArray(arr)) {
                    jsonObjects = arr;
                } else if (typeof arr === 'object') {
                    jsonObjects = [arr];
                }
            } catch (e) {
                // 2. ถ้าไม่สำเร็จ ให้รวม object ที่ถูก wrap ด้วย "..." (แต่ละ object อาจหลายบรรทัด)
                // ใช้ regex แยก object ที่ถูก wrap ด้วย "..." ออกจาก input
                const matches = input.match(/"({[\s\S]*?})"/g);
                if (matches && matches.length > 0) {
                    for (let m of matches) {
                        // ตัด " ที่หัวและท้าย
                        let line = m.slice(1, -1);
                        // แปลง double quote ซ้อนกันเป็น quote เดียว
                        line = line.replace(/""/g, '"');
                        try {
                            const obj = JSON.parse(line);
                            jsonObjects.push(obj);
                        } catch (err) {
                            parseError = true;
                            break;
                        }
                    }
                } else {
                    parseError = true;
                }
            }

            if (parseError || jsonObjects.length === 0) {
                showMessage('รูปแบบ JSON ไม่ถูกต้อง หรือไม่รองรับ', 'error');
                document.getElementById('resultTable').style.display = 'none';
                return;
            }

            // สร้างตาราง
            renderTable(jsonObjects, 'resultTableContent');
            document.getElementById('resultTable').style.display = 'block';
            showMessage('แปลง JSON สำเร็จ!', 'success');
        }

        function renderTable(data, elementId) {
            const headers = [
                'Mobile No',
                'ID Card',
                'Customer Account',
                'Service Account',
                'Billing Account',
                'Order No',
                'FS',
                'PrivateIdValue'
            ];

            let tableHTML = '<table><thead><tr>';
            headers.forEach((header, colIdx) => {
                tableHTML += `<th style="text-align:center;vertical-align:middle;white-space:nowrap;">
                    <span style="cursor:pointer" onclick="copyColumn(${colIdx})" title="คลิกเพื่อคัดลอกแนวตั้ง">${header}</span>
                    <button
                        style="
                            font-size:14px;
                            padding:2px 3px;
                            height:26px;
                            margin-left:1px;
                            vertical-align:middle;
                            border-radius:8px;
                            border:1px solid #d1d5db;
                            background:#f3f4f6;
                            cursor:pointer;
                            transition:background 0.2s;
                        "
                        onmouseover="this.style.background='#e0e7ef'"
                        onmouseout="this.style.background='#f3f4f6'"
                        onclick="event.stopPropagation();copyColumnWithQuotes(${colIdx})"
                        title="คัดลอกแบบมี quote"
                    >✂️</button>
                </th>`;
            });
            tableHTML += '</tr></thead><tbody>';

            data.forEach(row => {
                tableHTML += '<tr>';
                tableHTML += `<td>${row['nonMobileNo'] || ''}</td>`;
                tableHTML += `<td>${row['publicIdValue'] || ''}</td>`;
                tableHTML += `<td>${row['caNumber'] || ''}</td>`;
                tableHTML += `<td>${row['saNumber'] || ''}</td>`;
                tableHTML += `<td>${row['baNumber'] || ''}</td>`;
                tableHTML += `<td>${row['orderRefId'] || ''}</td>`;
                tableHTML += `<td>${row['orderNo'] || ''}</td>`;
                tableHTML += `<td>${row['privateIdValue'] || ''}</td>`;
                tableHTML += '</tr>';
            });

            tableHTML += '</tbody></table>';
            document.getElementById(elementId).innerHTML = tableHTML;

            window._verticalTableData = data.map(row => [
                row['nonMobileNo'] || '',
                row['publicIdValue'] || '',
                row['caNumber'] || '',
                row['saNumber'] || '',
                row['baNumber'] || '',
                row['orderRefId'] || '',
                row['orderNo'] || '',
                row['privateIdValue'] || ''
            ]);
        }

        // ฟังก์ชันคัดลอกแนวตั้งแบบ quote
        function copyColumnWithQuotes(colIdx) {
            if (!window._verticalTableData) return;
            const colData = window._verticalTableData.map(row => `'${row[colIdx]}'`);
            const text = colData.join(', ');
            navigator.clipboard.writeText(text).then(() => {
                showCopyNotification('คัดลอกแบบ quote แล้ว');
            });
        }

        // ฟังก์ชันคัดลอกแนวตั้งปกติ
        function copyColumn(colIdx) {
            if (!window._verticalTableData) return;
            const colData = window._verticalTableData.map(row => row[colIdx]);
            const text = colData.join('\n');
            navigator.clipboard.writeText(text).then(() => {
                showCopyNotification('คัดลอกแนวตั้งแล้ว');
            });
        }

        function copyTableData(tableId, format = 'csv') {
            const tableElement = document.querySelector(`#${tableId} table`);
            if (!tableElement) {
                showMessage('ไม่พบตารางที่จะคัดลอก');
                return;
            }

            let content = '';
            const rows = tableElement.querySelectorAll('tr');
            const separator = format === 'csv' ? ',' : '\t';
            
            rows.forEach((row, index) => {
                const cells = row.querySelectorAll('th, td');
                const rowData = [];
                
                cells.forEach(cell => {
                    let cellText = cell.textContent.trim();
                    
                    if (format === 'csv') {
                        // สำหรับ CSV: หากข้อมูลมี comma หรือ newline ให้ใส่เครื่องหมาย quote
                        if (cellText.includes(',') || cellText.includes('\n') || cellText.includes('"')) {
                            cellText = '"' + cellText.replace(/"/g, '""') + '"';
                        }
                    } else {
                        // สำหรับ TSV: แทนที่ tab ด้วย space
                        cellText = cellText.replace(/\t/g, ' ');
                    }
                    
                    rowData.push(cellText);
                });
                
                content += rowData.join(separator) + '\n';
            });

            // คัดลอกลง clipboard
            navigator.clipboard.writeText(content).then(() => {
                showCopyNotification(format.toUpperCase());
            }).catch(err => {
                // Fallback สำหรับเบราว์เซอร์เก่า
                const textArea = document.createElement('textarea');
                textArea.value = content;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showCopyNotification(format.toUpperCase());
            });
        }

        function showCopyNotification(format = '') {
            const notification = document.getElementById('copyNotification');
            notification.textContent = `คัดลอกข้อมูล ${format} สำเร็จ! 📋`;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 2000);
        }

        function generateSecondTable() {
            if (!jsonData || jsonData.length === 0) {
                showMessage('กรุณาแปลง JSON ก่อนสร้างตาราง 2nd');
                return;
            }

            const headers = ['Data_MobileNo', 'Data_Order', 'Data_Air'];

            let tableHTML = '<table><thead><tr>';
            headers.forEach(header => {
                tableHTML += `<th>${header}</th>`;
            });
            tableHTML += '</tr></thead><tbody>';

            jsonData.forEach(row => {
                tableHTML += '<tr>';
                tableHTML += `<td>${row['nonMobileNo'] || ''}</td>`;
                tableHTML += `<td>${row['orderRefId'] || ''}</td>`;
                tableHTML += `<td>${row['privateIdValue'] || ''}</td>`;
                tableHTML += '</tr>';
            });

            tableHTML += '</tbody></table>';
            
            document.getElementById('secondTableContent').innerHTML = tableHTML;
            document.getElementById('secondTable').style.display = 'block';
            
            showMessage(`สร้างตาราง 2nd สำเร็จ! พบข้อมูล ${jsonData.length} รายการ`, 'success');
        }

        function parseTextToJSON(text) {
            const records = text.split(/\n\s*\n/);
            const jsonArray = [];

            records.forEach(record => {
                const lines = record.split("\n").map(line => line.trim()).filter(line => line);
                const jsonObject = {};
                const attributeList = [];

                lines.forEach(line => {
                    if (line.startsWith("#### AttributeList")) {
                        return;
                    }

                    if (line.startsWith("---")) {
                        const attrParts = line.replace("---", "").split(" : ");
                        if (attrParts.length === 2) {
                            const key = attrParts[0].trim();
                            const value = attrParts[1].trim();
                            attributeList.push({ [key]: value });
                        }
                    } else {
                        const parts = line.split(" : ");
                        if (parts.length === 2) {
                            const key = parts[0].trim();
                            const value = parts[1].trim();
                            jsonObject[key] = value !== "null" ? value : "";
                        }
                    }
                });

                const attributeNonMobileNos = attributeList
                    .filter(attr => attr.hasOwnProperty("nonMobileNo"))
                    .map(attr => attr["nonMobileNo"])
                    .join(", ");

                jsonObject["Attribute_NonMobileNo"] = attributeNonMobileNos;
                
                if (Object.keys(jsonObject).length > 0) {
                    jsonArray.push(jsonObject);
                }
            });

            return jsonArray;
        }

        function convertTextToTable() {
            const textData = document.getElementById('jsonInput').value.trim();
            
            if (!textData) {
                showMessage('กรุณาใส่ข้อมูล Text');
                return;
            }

            try {
                const parsedData = parseTextToJSON(textData);
                
                if (!Array.isArray(parsedData) || parsedData.length === 0) {
                    showMessage('ไม่พบข้อมูลที่ถูกต้องในข้อความที่ใส่');
                    return;
                }

                const headers = [
                    'Mobile No',
                    'ID Card',
                    'Customer Account',
                    'Service Account',
                    'Billing Account',
                    'Order No',
                    'Reference No'
                ];

                let tableHTML = '<table><thead><tr>';
                headers.forEach(header => {
                    tableHTML += `<th>${header}</th>`;
                });
                tableHTML += '</tr></thead><tbody>';

                parsedData.forEach(row => {
                    const mobile = row['nonMobileNo'] || row['Attribute_NonMobileNo'] || '';
                    const refNo = row['referanceNo'] || '';
                    const idCard = refNo.startsWith('FBB-') ? 'D' + refNo.replace('FBB-', '').replace(/-/g, '') : '';

                    tableHTML += '<tr>';
                    tableHTML += `<td>${mobile}</td>`;
                    tableHTML += `<td>${idCard}</td>`;
                    tableHTML += `<td>${row['caNumber'] || ''}</td>`;
                    tableHTML += `<td>${row['saNumber'] || ''}</td>`;
                    tableHTML += `<td>${row['baNumber'] || ''}</td>`;
                    tableHTML += `<td>${row['OrderNo'] || ''}</td>`;
                    tableHTML += `<td>${refNo}</td>`;
                    tableHTML += '</tr>';
                });

                tableHTML += '</tbody></table>';
                
                document.getElementById('resultTableContent').innerHTML = tableHTML;
                document.getElementById('resultTable').style.display = 'block';
                
                showMessage(`แปลงข้อมุล Text สำเร็จ! พบข้อมูล ${parsedData.length} รายการ`, 'success');
                
                // เก็บข้อมูลสำหรับใช้กับตาราง 2nd
                jsonData = parsedData;
                
            } catch (e) {
                showMessage(`เกิดข้อผิดพลาดในการแปลงข้อมูล: ${e.message}`);
            }
        }

        function clearAll() {
            document.getElementById('jsonInput').value = '';
            document.getElementById('resultTable').style.display = 'none';
            document.getElementById('secondTable').style.display = 'none';
            document.getElementById('messageArea').innerHTML = '';
            jsonData = [];
            showMessage('ล้างข้อมูลเรียบร้อยแล้ว', 'success');
        }

        // Example data for testing
        function loadExampleJSON() {
            const exampleData = `[
  {
    "nonMobileNo": "0812345678",
    "publicIdValue": "1234567890123",
    "caNumber": "CA001",
    "saNumber": "SA001",
    "baNumber": "BA001",
    "orderRefId": "ORD001",
    "orderNo": "FS001",
    "privateIdValue": "PID001"
  }
]`;
            document.getElementById('jsonInput').value = exampleData;
        }

        function loadExampleText() {
            const exampleText = `nonMobileNo : 0812345678
publicIdValue : 1234567890123
caNumber : CA001
saNumber : SA001
baNumber : BA001
referanceNo : FBB-123-456
OrderNo : ORD001

#### AttributeList
--- nonMobileNo : 0812345678

nonMobileNo : 0898765432
publicIdValue : 9876543210987
caNumber : CA002
saNumber : SA002
baNumber : BA002
referanceNo : FBB-789-012
OrderNo : ORD002

#### AttributeList
--- nonMobileNo : 0898765432`;
            document.getElementById('jsonInput').value = exampleText;
        }

        // เพิ่มฟังก์ชันนี้ท้ายไฟล์
        function copyVerticalRow(rowIndex) {
            if (!window._verticalTableData) return;
            const row = window._verticalTableData[rowIndex];
            const text = row.join('\n');
            navigator.clipboard.writeText(text).then(() => {
                showCopyNotification('แนวตั้ง');
            });
        }
