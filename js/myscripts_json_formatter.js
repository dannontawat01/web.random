let isDarkMode = false;
        let currentJSON = null;
        let outputDarkMode = true;
        let outputHistory = [];

        function processJSON() {
            const input = document.getElementById('jsonInput').value.trim();
            const validateOnly = document.getElementById('validateOnly').checked;
            if (validateOnly) {
                validateJSON();
                return;
            }
            formatJSON();
        }

        function formatJSON() {
            const input = document.getElementById('jsonInput').value.trim();
            const sortKeys = document.getElementById('sortKeys').checked;
            const indentSize = parseInt(document.getElementById('indentSize').value);

            clearMessage();

            if (!input) {
                showMessage('กรุณาใส่ข้อมูล JSON', 'error');
                return;
            }

            try {
                let obj = JSON.parse(input);
                if (sortKeys) obj = sortObjectKeys(obj);

                const formatted = JSON.stringify(obj, null, indentSize);
                const minified = JSON.stringify(obj);
                const timestamp = new Date();

                // เพิ่มเข้า history
                outputHistory.unshift({
                    formatted,
                    minified,
                    obj,
                    timestamp
                });

                renderHistory();

                showMessage('JSON ถูกต้องและจัดรูปแบบแล้ว!', 'success');
                updateStats(obj, formatted, minified);
                document.getElementById('stats').style.display = 'grid';

            } catch (e) {
                showMessage('รูปแบบ JSON ไม่ถูกต้อง: ' + e.message, 'error');
                document.getElementById('stats').style.display = 'none';
            }
        }

        function renderHistory() {
            const section = document.getElementById('historySection');
            section.innerHTML = '';
            outputHistory.forEach((item, idx) => {
                // สร้าง unique id สำหรับ tab แต่ละกล่อง
                const boxId = `history_${idx}`;
                const formattedId = `formatted_${boxId}`;
                const treeId = `tree_${boxId}`;
                const minifiedId = `minified_${boxId}`;

                // กล่องผลลัพธ์แต่ละชุด
                const box = document.createElement('div');
                box.style.margin = '32px 0';
                box.style.background = '#fff';
                box.style.borderRadius = '12px';
                box.style.boxShadow = '0 2px 8px rgba(102,126,234,0.13)';
                box.style.padding = '24px';
                box.style.position = 'relative';

                box.innerHTML = `
                    <div style="font-weight:bold;font-size:1.1rem;color:#5a67d8;">
                        #${outputHistory.length - idx} 
                        <span style="font-size:0.9rem;color:#718096;margin-left:8px;">
                            ${item.timestamp.toLocaleString()}
                        </span>
                    </div>
                    <div class="output-controls" style="margin:12px 0 8px 0;">
                        <button class="btn" onclick="copyHistoryOutput('${boxId}')">📋 Copy</button>
                        <button class="btn" onclick="downloadHistoryOutput('${boxId}')">💾 Download</button>
                        <button class="btn" onclick="toggleHistoryTheme('${boxId}')">🎨 Theme</button>
                    </div>
                    <div class="tabs" id="tabs_${boxId}">
                        <button class="tab active" onclick="switchHistoryTab('${boxId}', 'formatted')">Formatted</button>
                        <button class="tab" onclick="switchHistoryTab('${boxId}', 'tree')">Tree View</button>
                        <button class="tab" onclick="switchHistoryTab('${boxId}', 'minified')">Minified</button>
                    </div>
                    <div id="${formattedId}" class="tab-content active">
                        <div class="result">${escapeHTML(item.formatted)}</div>
                    </div>
                    <div id="${treeId}" class="tab-content">
                        <div class="result" id="treeResult_${boxId}"></div>
                    </div>
                    <div id="${minifiedId}" class="tab-content">
                        <div class="result">${escapeHTML(item.minified)}</div>
                    </div>
                `;
                section.appendChild(box);

                // Render Tree View
                setTimeout(() => {
                    generateTreeViewHistory(item.obj, `treeResult_${boxId}`);
                }, 0);
            });
        }

        // ฟังก์ชันคัดลอกและดาวน์โหลด
        function copyText(text) {
            navigator.clipboard.writeText(text);
        }
        function downloadText(text, filename) {
            const blob = new Blob([text], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = filename; a.click();
            URL.revokeObjectURL(url);
        }

        function validateJSON() {
            const input = document.getElementById('jsonInput').value.trim();
            
            clearMessage();
            
            if (!input) {
                showMessage('กรุณาใส่ข้อมูล JSON', 'error');
                return;
            }
            
            try {
                const obj = JSON.parse(input);
                currentJSON = obj;
                showMessage('✅ JSON ถูกต้อง!', 'success');
                updateStats(obj, input, JSON.stringify(obj));
                document.getElementById('stats').style.display = 'grid';
                document.getElementById('outputSection').style.display = 'none';
            } catch (e) {
                showMessage('❌ รูปแบบ JSON ไม่ถูกต้อง: ' + e.message, 'error');
                document.getElementById('outputSection').style.display = 'none';
                document.getElementById('stats').style.display = 'none';
            }
        }
        
        function clearAll() {
            // ล้าง input
            document.getElementById('jsonInput').value = '';
            // ล้าง output
            document.getElementById('outputSection').style.display = 'none';
            // ล้าง stats
            document.getElementById('stats').style.display = 'none';
            // ล้าง message
            clearMessage();
            // ล้างตัวแปร JSON ปัจจุบัน
            currentJSON = null;
            // ล้าง history ทั้งหมด
            outputHistory = [];
            renderHistory();
        }
        
        function loadExample() {
            const example = {
                "user": {
                    "id": 12345,
                    "name": "John Doe",
                    "email": "john@example.com",
                    "age": 30,
                    "active": true,
                    "location": {
                        "city": "Bangkok",
                        "country": "Thailand",
                        "coordinates": {
                            "lat": 13.7563,
                            "lng": 100.5018
                        }
                    },
                    "preferences": {
                        "theme": "dark",
                        "language": "th",
                        "notifications": true
                    },
                    "hobbies": ["reading", "coding", "traveling", "photography"],
                    "skills": {
                        "programming": ["JavaScript", "Python", "Go"],
                        "languages": ["Thai", "English", "Japanese"],
                        "tools": ["VS Code", "Git", "Docker"]
                    }
                },
                "metadata": {
                    "created": "2024-01-15T08:30:00Z",
                    "updated": "2024-07-14T15:45:00Z",
                    "version": "1.2.3",
                    "source": "api",
                    "environment": "production"
                }
            };
            document.getElementById('jsonInput').value = JSON.stringify(example, null, 2);
        }
        
        function copyOutput() {
            const activeTab = document.querySelector('.tab.active').textContent;
            let content = '';
            
            switch(activeTab) {
                case 'Formatted':
                    content = document.getElementById('formattedResult').textContent;
                    break;
                case 'Tree View':
                    content = document.getElementById('treeResult').textContent;
                    break;
                case 'Minified':
                    content = document.getElementById('minifiedResult').textContent;
                    break;
            }
            
            navigator.clipboard.writeText(content).then(() => {
                showMessage('คัดลอกเรียบร้อยแล้ว!', 'success');
            }).catch(() => {
                showMessage('ไม่สามารถคัดลอกได้', 'error');
            });
        }
        
        function downloadJSON() {
            if (!currentJSON) {
                showMessage('ไม่มีข้อมูล JSON ให้ดาวน์โหลด', 'error');
                return;
            }
            
            const content = JSON.stringify(currentJSON, null, 2);
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'formatted.json';
            a.click();
            URL.revokeObjectURL(url);
            showMessage('ไฟล์ถูกดาวน์โหลดแล้ว!', 'success');
        }
        
        function toggleOutputTheme() {
            outputDarkMode = !outputDarkMode;
            const results = document.querySelectorAll('.result');
            results.forEach(result => {
                if (outputDarkMode) {
                    result.classList.remove('light-theme');
                } else {
                    result.classList.add('light-theme');
                }
            });
        }
        
        function switchTab(tabName) {
            // Update tab buttons
            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            event.target.classList.add('active');
            
            // Update tab content
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById(tabName).classList.add('active');
        }
        
        function generateTreeView(obj) {
            const treeResult = document.getElementById('treeResult');
            treeResult.innerHTML = '';
            
            function createTreeNode(value, key = null, level = 0) {
                const div = document.createElement('div');
                div.style.marginLeft = (level * 20) + 'px';
                div.className = 'json-tree';
                
                if (key !== null) {
                    const keySpan = document.createElement('span');
                    keySpan.className = 'json-key';
                    keySpan.textContent = '"' + key + '": ';
                    div.appendChild(keySpan);
                }
                
                if (typeof value === 'object' && value !== null) {
                    if (Array.isArray(value)) {
                        const toggle = document.createElement('span');
                        toggle.className = 'collapsible';
                        toggle.textContent = '[';
                        toggle.onclick = () => toggleCollapse(toggle);
                        div.appendChild(toggle);
                        
                        const content = document.createElement('div');
                        content.className = 'json-content';
                        
                        value.forEach((item, index) => {
                            const itemDiv = createTreeNode(item, index, level + 1);
                            content.appendChild(itemDiv);
                        });
                        
                        const closeBracket = document.createElement('div');
                        closeBracket.style.marginLeft = (level * 20) + 'px';
                        closeBracket.textContent = ']';
                        content.appendChild(closeBracket);
                        
                        div.appendChild(content);
                    } else {
                        const toggle = document.createElement('span');
                        toggle.className = 'collapsible';
                        toggle.textContent = '{';
                        toggle.onclick = () => toggleCollapse(toggle);
                        div.appendChild(toggle);
                        
                        const content = document.createElement('div');
                        content.className = 'json-content';
                        
                        Object.keys(value).forEach(k => {
                            const itemDiv = createTreeNode(value[k], k, level + 1);
                            content.appendChild(itemDiv);
                        });
                        
                        const closeBrace = document.createElement('div');
                        closeBrace.style.marginLeft = (level * 20) + 'px';
                        closeBrace.textContent = '}';
                        content.appendChild(closeBrace);
                        
                        div.appendChild(content);
                    }
                } else {
                    const valueSpan = document.createElement('span');
                    
                    if (typeof value === 'string') {
                        valueSpan.className = 'json-string';
                        valueSpan.textContent = '"' + value + '"';
                    } else if (typeof value === 'number') {
                        valueSpan.className = 'json-number';
                        valueSpan.textContent = value;
                    } else if (typeof value === 'boolean') {
                        valueSpan.className = 'json-boolean';
                        valueSpan.textContent = value;
                    } else if (value === null) {
                        valueSpan.className = 'json-null';
                        valueSpan.textContent = 'null';
                    }
                    
                    div.appendChild(valueSpan);
                }
                
                return div;
            }
            
            function toggleCollapse(element) {
                const content = element.parentElement.querySelector('.json-content');
                if (content.classList.contains('hidden')) {
                    content.classList.remove('hidden');
                    element.classList.remove('collapsed');
                } else {
                    content.classList.add('hidden');
                    element.classList.add('collapsed');
                }
            }
            
            const tree = createTreeNode(obj);
            treeResult.appendChild(tree);
        }
        
        function sortObjectKeys(obj) {
            if (typeof obj !== 'object' || obj === null) return obj;
            
            if (Array.isArray(obj)) {
                return obj.map(sortObjectKeys);
            }
            
            const sorted = {};
            Object.keys(obj).sort().forEach(key => {
                sorted[key] = sortObjectKeys(obj[key]);
            });
            
            return sorted;
        }
        
        function showMessage(text, type) {
            const messageDiv = document.getElementById('message');
            messageDiv.textContent = text;
            messageDiv.className = type;
        }
        
        function clearMessage() {
            document.getElementById('message').textContent = '';
            document.getElementById('message').className = '';
        }
        
        function updateStats(obj, formatted, minified) {
            const charCount = formatted.length;
            const lineCount = formatted.split('\n').length;
            const objectCount = countObjects(obj);
            const arrayCount = countArrays(obj);
            const keysCount = countKeys(obj);
            const sizeBytes = new Blob([formatted]).size;
            
            document.getElementById('charCount').textContent = charCount.toLocaleString();
            document.getElementById('lineCount').textContent = lineCount.toLocaleString();
            document.getElementById('objectCount').textContent = objectCount.toLocaleString();
            document.getElementById('arrayCount').textContent = arrayCount.toLocaleString();
            document.getElementById('keysCount').textContent = keysCount.toLocaleString();
            document.getElementById('sizeBytes').textContent = sizeBytes.toLocaleString();
        }
        
        function countObjects(obj) {
            let count = 0;
            if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
                count = 1;
                for (let key in obj) {
                    count += countObjects(obj[key]);
                }
            } else if (Array.isArray(obj)) {
                for (let item of obj) {
                    count += countObjects(item);
                }
            }
            return count;
        }
        
        function countArrays(obj) {
            let count = 0;
            if (Array.isArray(obj)) {
                count = 1;
                for (let item of obj) {
                    count += countArrays(item);
                }
            } else if (typeof obj === 'object' && obj !== null) {
                for (let key in obj) {
                    count += countArrays(obj[key]);
                }
            }
            return count;
        }
        
        function countKeys(obj) {
            let count = 0;
            if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
                count = Object.keys(obj).length;
                for (let key in obj) {
                    count += countKeys(obj[key]);
                }
            } else if (Array.isArray(obj)) {
                for (let item of obj) {
                    count += countKeys(item);
                }
            }
            return count;
        }
        
        // function toggleTheme() {
        //     const body = document.body;
        //     const toggleBtn = document.querySelector('.toggle-theme');
        //     const isDark = body.classList.toggle('dark-mode');
        //     if (isDark) {
        //         toggleBtn.textContent = '☀️';
        //     } else {
        //         toggleBtn.textContent = '🌙';
        //     }
        // }
        
        // Auto-resize textarea
        document.getElementById('jsonInput').addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.max(200, this.scrollHeight) + 'px';
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'Enter':
                        e.preventDefault();
                        processJSON();
                        break;
                    case 'k':
                        e.preventDefault();
                        clearAll();
                        break;
                    case 'l':
                        e.preventDefault();
                        loadExample();
                        break;
                    case 'm':
                        e.preventDefault();
                        minifyJSON();
                        break;
                }
            }
        });
        
        // ฟังก์ชันสำหรับ Copy/Download/Theme/Tab ของแต่ละกล่อง
        function copyHistoryOutput(boxId) {
            const tab = document.querySelector(`#tabs_${boxId} .tab.active`).textContent;
            let content = '';
            if (tab === 'Formatted') {
                content = document.querySelector(`#formatted_${boxId} .result`).textContent;
            } else if (tab === 'Tree View') {
                content = document.querySelector(`#treeResult_${boxId}`).textContent;
            } else if (tab === 'Minified') {
                content = document.querySelector(`#minified_${boxId} .result`).textContent;
            }
            navigator.clipboard.writeText(content);
        }
        function downloadHistoryOutput(boxId) {
            const tab = document.querySelector(`#tabs_${boxId} .tab.active`).textContent;
            let content = '';
            let filename = '';
            if (tab === 'Formatted') {
                content = document.querySelector(`#formatted_${boxId} .result`).textContent;
                filename = 'formatted.json';
            } else if (tab === 'Tree View') {
                content = document.querySelector(`#treeResult_${boxId}`).textContent;
                filename = 'treeview.txt';
            } else if (tab === 'Minified') {
                content = document.querySelector(`#minified_${boxId} .result`).textContent;
                filename = 'minified.json';
            }
            const blob = new Blob([content], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = filename; a.click();
            URL.revokeObjectURL(url);
        }
        function toggleHistoryTheme(boxId) {
            // toggle light/dark theme เฉพาะกล่องนี้
            ['formatted', 'tree', 'minified'].forEach(type => {
                const el = document.querySelector(`#${type}_${boxId} .result`);
                if (el) el.classList.toggle('light-theme');
            });
        }
        function switchHistoryTab(boxId, tabName) {
            // Update tab buttons
            document.querySelectorAll(`#tabs_${boxId} .tab`).forEach(tab => tab.classList.remove('active'));
            document.querySelector(`#tabs_${boxId} .tab[onclick*="${tabName}"]`).classList.add('active');
            // Update tab content
            ['formatted', 'tree', 'minified'].forEach(type => {
                document.getElementById(`${type}_${boxId}`).classList.remove('active');
            });
            document.getElementById(`${tabName}_${boxId}`).classList.add('active');
        }
        
        // Render Tree View สำหรับแต่ละกล่อง
        function generateTreeViewHistory(obj, containerId) {
            const treeResult = document.getElementById(containerId);
            if (!treeResult) return;
            treeResult.innerHTML = '';
            function createTreeNode(value, key = null, level = 0) {
                const div = document.createElement('div');
                div.style.marginLeft = (level * 20) + 'px';
                div.className = 'json-tree';
                if (key !== null) {
                    const keySpan = document.createElement('span');
                    keySpan.className = 'json-key';
                    keySpan.textContent = '"' + key + '": ';
                    div.appendChild(keySpan);
                }
                if (typeof value === 'object' && value !== null) {
                    if (Array.isArray(value)) {
                        const toggle = document.createElement('span');
                        toggle.className = 'collapsible';
                        toggle.textContent = '[';
                        toggle.onclick = () => toggleCollapse(toggle);
                        div.appendChild(toggle);
                        const content = document.createElement('div');
                        content.className = 'json-content';
                        value.forEach((item, index) => {
                            const itemDiv = createTreeNode(item, index, level + 1);
                            content.appendChild(itemDiv);
                        });
                        const closeBracket = document.createElement('div');
                        closeBracket.style.marginLeft = (level * 20) + 'px';
                        closeBracket.textContent = ']';
                        content.appendChild(closeBracket);
                        div.appendChild(content);
                    } else {
                        const toggle = document.createElement('span');
                        toggle.className = 'collapsible';
                        toggle.textContent = '{';
                        toggle.onclick = () => toggleCollapse(toggle);
                        div.appendChild(toggle);
                        const content = document.createElement('div');
                        content.className = 'json-content';
                        Object.keys(value).forEach(k => {
                            const itemDiv = createTreeNode(value[k], k, level + 1);
                            content.appendChild(itemDiv);
                        });
                        const closeBrace = document.createElement('div');
                        closeBrace.style.marginLeft = (level * 20) + 'px';
                        closeBrace.textContent = '}';
                        content.appendChild(closeBrace);
                        div.appendChild(content);
                    }
                } else {
                    const valueSpan = document.createElement('span');
                    if (typeof value === 'string') {
                        valueSpan.className = 'json-string';
                        valueSpan.textContent = '"' + value + '"';
                    } else if (typeof value === 'number') {
                        valueSpan.className = 'json-number';
                        valueSpan.textContent = value;
                    } else if (typeof value === 'boolean') {
                        valueSpan.className = 'json-boolean';
                        valueSpan.textContent = value;
                    } else if (value === null) {
                        valueSpan.className = 'json-null';
                        valueSpan.textContent = 'null';
                    }
                    div.appendChild(valueSpan);
                }
                return div;
            }
            function toggleCollapse(element) {
                const content = element.parentElement.querySelector('.json-content');
                if (content.classList.contains('hidden')) {
                    content.classList.remove('hidden');
                    element.classList.remove('collapsed');
                } else {
                    content.classList.add('hidden');
                    element.classList.add('collapsed');
                }
            }
            const tree = createTreeNode(obj);
            treeResult.appendChild(tree);
        }
        
        // Escape HTML เพื่อป้องกัน XSS
        function escapeHTML(str) {
            return str.replace(/[&<>"']/g, function(m) {
                return ({
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                })[m];
            });
        }
        
        function clearHistory() {
            outputHistory = [];
            renderHistory();
        }

        function navigateTo(url) {
            window.location.href = url;
        }

        // ตรวจสอบหน้าไหนที่กำลังเปิดอยู่
        window.addEventListener('DOMContentLoaded', () => {
            const currentPage = window.location.pathname.split('/').pop(); // เช่น "index.html"
            switch (currentPage) {
                case 'index.html':
                case '': // สำหรับหน้า root
                    document.getElementById('btn-index').classList.add('active');
                    break;
                case 'json.html':
                    document.getElementById('btn-json').classList.add('active');
                    break;
                case 'json_formatter.html':
                    document.getElementById('btn-formatter').classList.add('active');
                    break;
            }
        });
