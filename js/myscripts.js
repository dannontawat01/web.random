        let thaiIdResults = [];
        let guidResults = [];
        let nameResults = [];
        let customNumberResults = [];
        let generatedThaiIds = new Set();

        // --- Name Data (to be populated from data.json) ---
        let firstNamesFemaleTh = [], firstNamesFemaleEn = [];
        let firstNamesMaleTh = [], firstNamesMaleEn = [];
        let allLastNamesTh = [], allLastNamesEn = []; 
        let nicknamesFemaleTh = [], nicknamesFemaleEn = [];
        let nicknamesMaleTh = [], nicknamesMaleEn = [];
        let allFirstNamesTh = [], allFirstNamesEn = []; // Combined for 'any' gender
        let allNicknamesTh = [], allNicknamesEn = []; // Combined for 'any' gender

        async function loadNameData() {
            const generateNameBtn = document.getElementById('generateNameBtn');
            const originalBtnText = generateNameBtn.innerHTML;
            generateNameBtn.disabled = true;
            generateNameBtn.innerHTML = '⏳ กำลังโหลดข้อมูล...';

            try {
                const response = await fetch('data.json'); // Assuming data.json is in the same directory
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                data.firstnameFemale.forEach(name => {
                    if (name.th) firstNamesFemaleTh.push(name.th);
                    if (name.en) firstNamesFemaleEn.push(name.en);
                });
                data.firstnameMale.forEach(name => {
                    if (name.th) firstNamesMaleTh.push(name.th);
                    if (name.en) firstNamesMaleEn.push(name.en);
                });
                data.lastname.forEach(name => {
                    if (name.th) allLastNamesTh.push(name.th);
                    if (name.en) allLastNamesEn.push(name.en);
                });
                data.nicknameFemale.forEach(name => {
                    if (name.th) nicknamesFemaleTh.push(name.th);
                    if (name.en) nicknamesFemaleEn.push(name.en);
                });
                data.nicknameMale.forEach(name => {
                    if (name.th) nicknamesMaleTh.push(name.th);
                    if (name.en) nicknamesMaleEn.push(name.en);
                });

                allFirstNamesTh = [...firstNamesFemaleTh, ...firstNamesMaleTh];
                allFirstNamesEn = [...firstNamesFemaleEn, ...firstNamesMaleEn];
                allNicknamesTh = [...nicknamesFemaleTh, ...nicknamesMaleTh];
                allNicknamesEn = [...nicknamesFemaleEn, ...nicknamesMaleEn];
                
                if (generateNameBtn) {
                     showNotification('โหลดข้อมูลชื่อสำเร็จ!', 'success');
                    generateNameBtn.disabled = false;
                    generateNameBtn.innerHTML = originalBtnText;
                }
            } catch (error) {
                console.error("Failed to load name data:", error);
                if (generateNameBtn) {
                    showNotification('เกิดข้อผิดพลาดในการโหลดข้อมูลชื่อ!', 'error');
                    generateNameBtn.innerHTML = '⚠️ โหลดข้อมูลล้มเหลว';
                }
            }
        }


        // Tab Management
        function switchTab(tabName, event) {
            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            if (event && event.target) {
                 event.target.classList.add('active');
            } else { 
                const fallbackTab = Array.from(document.querySelectorAll('.tab')).find(t => t.getAttribute('onclick').includes(tabName));
                if (fallbackTab) fallbackTab.classList.add('active');
            }
            document.getElementById(tabName).classList.add('active');
        }

        // --- Thai ID Functions ---
        function createThaiId() {
            const firstDigit = Math.floor(Math.random() * 8) + 1; 
            const remainingDigits = Array.from({length: 11}, () => Math.floor(Math.random() * 10));
            const idNumbers = [firstDigit, ...remainingDigits];
            let total = 0;
            for (let i = 0; i < 12; i++) {
                total += (13 - i) * idNumbers[i];
            }
            const checkDigit = (11 - (total % 11)) % 10;
            idNumbers.push(checkDigit);
            return idNumbers.join('');
        }

        async function generateThaiIds() {
            const countInput = document.getElementById('thaiIdCount');
            const count = parseInt(countInput.value);
            const generateBtn = document.getElementById('generateThaiIdBtn');
            if (!count || count <= 0 || count > 1000) {
                showNotification('กรุณาระบุจำนวนระหว่าง 1-1000', 'warning');
                return;
            }
            generateBtn.classList.add('loading');
            generateBtn.innerHTML = '⏳ กำลังสร้าง...';
            generateBtn.disabled = true;
            generatedThaiIds.clear();
            const resultArea = document.getElementById('thaiIdResultArea');
            resultArea.value = ''; 
            const allNewIds = [];
            let attempts = 0;
            const maxAttempts = count * 1000; 
            for (let i = 0; i < count; i++) {
                let newId;
                do {
                    newId = createThaiId();
                    attempts++;
                    if (attempts > maxAttempts && allNewIds.length < i + 1) {
                        showNotification('ไม่สามารถสร้างเลขที่ไม่ซ้ำกันได้เพียงพอ ลองอีกครั้ง', 'warning');
                        break;
                    }
                } while (generatedThaiIds.has(newId) && attempts <= maxAttempts);
                if (!generatedThaiIds.has(newId)) {
                    generatedThaiIds.add(newId);
                    allNewIds.push(newId);
                }
                if ((i + 1) % 50 === 0 || (i + 1) === count) {
                    updateThaiIdResultsDisplay(allNewIds); 
                    await new Promise(resolve => setTimeout(resolve, 1)); 
                }
                if (attempts > maxAttempts && allNewIds.length < count) break;
            }
            thaiIdResults = allNewIds; 
            updateThaiIdResultsDisplay(thaiIdResults); 
            if (thaiIdResults.length > 0) {
                 await autoCopyResults(thaiIdResults.join('\n'), `สร้างและคัดลอกเลขไทยสำเร็จ ${thaiIdResults.length} เลข 📋`);
            } else if (count > 0) {
                showNotification('ไม่สามารถสร้างเลขได้', 'error');
            }
            generateBtn.classList.remove('loading');
            generateBtn.innerHTML = '🎲 สุ่มเลข';
            generateBtn.disabled = false;
        }
        
        function updateThaiIdResultsDisplay(idsToDisplay) {
            const resultArea = document.getElementById('thaiIdResultArea');
            const generatedCount = document.getElementById('thaiIdGeneratedCount');
            resultArea.value = idsToDisplay.map(id => formatThaiId(id)).join('\n');
            generatedCount.textContent = idsToDisplay.length.toLocaleString();
        }

        function formatThaiId(id) {
            if (!id || id.length !== 13) return id;
            return id.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, '$1-$2-$3-$4-$5');
        }

        function copyThaiIdResults() {
            if (thaiIdResults.length === 0) {
                showNotification('ยังไม่มีเลขที่สุ่ม!', 'warning');
                return;
            }
            copyToClipboard(thaiIdResults.join('\n'), `คัดลอกเลขไทยสำเร็จ ${thaiIdResults.length} เลข`);
        }

        function clearThaiIdResults() {
            if (thaiIdResults.length === 0) {
                showNotification('ไม่มีข้อมูลให้ล้าง', 'warning');
                return;
            }
            if (confirm(`คุณต้องการล้างผลลัพธ์ ${thaiIdResults.length} เลข หรือไม่?`)) {
                generatedThaiIds.clear();
                thaiIdResults = [];
                document.getElementById('thaiIdResultArea').value = '';
                document.getElementById('thaiIdGeneratedCount').textContent = '0';
                showNotification('ล้างผลลัพธ์เลขไทยสำเร็จ', 'success');
            }
        }

        // --- GUID Functions ---
        function generateGuid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        function formatGuid(guid) {
            const upperCase = document.getElementById('upperCase').checked;
            const withBraces = document.getElementById('withBraces').checked;
            const withoutHyphens = document.getElementById('withoutHyphens').checked;
            let result = guid;
            if (upperCase) result = result.toUpperCase();
            if (withoutHyphens) result = result.replace(/-/g, '');
            if (withBraces) result = `{${result}}`;
            return result;
        }

        async function generateGuids() {
            const countInput = document.getElementById('guidCount');
            const count = parseInt(countInput.value);
            const generateBtn = document.getElementById('generateGuidBtn');
            if (!count || count <= 0 || count > 1000) {
                showNotification('กรุณาระบุจำนวนระหว่าง 1-1000', 'warning');
                return;
            }
            generateBtn.classList.add('loading');
            generateBtn.innerHTML = '⏳ กำลังสร้าง...';
            generateBtn.disabled = true;
            const resultArea = document.getElementById('guidResultArea');
            resultArea.value = ''; 
            const newGuids = [];
            for (let i = 0; i < count; i++) {
                newGuids.push(generateGuid());
                if ((i + 1) % 50 === 0 || (i + 1) === count) {
                    updateGuidResultsDisplay(newGuids);
                    await new Promise(resolve => setTimeout(resolve, 1)); 
                }
            }
            guidResults = newGuids;
            updateGuidResultsDisplay(guidResults);
             if (guidResults.length > 0) {
                await autoCopyResults(guidResults.map(g => formatGuid(g)).join('\n'), `สร้างและคัดลอก GUID สำเร็จ ${guidResults.length} ตัว 📋`);
            }
            generateBtn.classList.remove('loading');
            generateBtn.innerHTML = '🎲 สุ่ม GUID';
            generateBtn.disabled = false;
        }

        function updateGuidResultsDisplay(guidsToDisplay) {
            const resultArea = document.getElementById('guidResultArea');
            const generatedCount = document.getElementById('guidGeneratedCount');
            resultArea.value = guidsToDisplay.map(guid => formatGuid(guid)).join('\n');
            generatedCount.textContent = guidsToDisplay.length.toLocaleString();
        }
        
        function copyGuidResults() {
            if (guidResults.length === 0) {
                showNotification('ยังไม่มี GUID ที่สุ่ม!', 'warning');
                return;
            }
            copyToClipboard(guidResults.map(guid => formatGuid(guid)).join('\n'), `คัดลอก GUID สำเร็จ ${guidResults.length} ตัว`);
        }

        function clearGuidResults() {
             if (guidResults.length === 0) {
                showNotification('ไม่มีข้อมูลให้ล้าง', 'warning');
                return;
            }
            if (confirm(`คุณต้องการล้างผลลัพธ์ ${guidResults.length} GUID หรือไม่?`)) {
                guidResults = [];
                document.getElementById('guidResultArea').value = '';
                document.getElementById('guidGeneratedCount').textContent = '0';
                showNotification('ล้างผลลัพธ์ GUID สำเร็จ', 'success');
            }
        }

        // --- Random Name Functions ---
        function createRandomName() {
            const selectedGender = document.querySelector('input[name="gender"]:checked').value;
            const langTh = document.getElementById('nameLangTh').checked;
            const langEn = document.getElementById('nameLangEn').checked;
            const typeFirst = document.getElementById('nameTypeFirst').checked;
            const typeLast = document.getElementById('nameTypeLast').checked;
            const typeNickname = document.getElementById('nameTypeNickname').checked;

            if (allLastNamesTh.length === 0 && allFirstNamesTh.length === 0 && allNicknamesTh.length === 0) { // Basic check if data isn't loaded
                return "ข้อมูลชื่อยังไม่พร้อมใช้งาน";
            }

            let thNameParts = [];
            let enNameParts = [];

            // Helper function to get corresponding names from data arrays
            function getCorrespondingName(thArray, enArray, selectedIndex) {
                if (selectedIndex >= 0 && selectedIndex < thArray.length && selectedIndex < enArray.length) {
                    return {
                        th: thArray[selectedIndex],
                        en: enArray[selectedIndex]
                    };
                }
                return { th: "", en: "" };
            }

            // Select indices for each name part
            let firstNameIndex = -1, lastNameIndex = -1, nicknameIndex = -1;

            // Get appropriate arrays based on gender
            let currentFirstNamesTh, currentFirstNamesEn, currentNicknamesTh, currentNicknamesEn;
            if (selectedGender === 'female') {
                currentFirstNamesTh = firstNamesFemaleTh;
                currentFirstNamesEn = firstNamesFemaleEn;
                currentNicknamesTh = nicknamesFemaleTh;
                currentNicknamesEn = nicknamesFemaleEn;
            } else if (selectedGender === 'male') {
                currentFirstNamesTh = firstNamesMaleTh;
                currentFirstNamesEn = firstNamesMaleEn;
                currentNicknamesTh = nicknamesMaleTh;
                currentNicknamesEn = nicknamesMaleEn;
            } else { // 'any'
                currentFirstNamesTh = allFirstNamesTh;
                currentFirstNamesEn = allFirstNamesEn;
                currentNicknamesTh = allNicknamesTh;
                currentNicknamesEn = allNicknamesEn;
            }

            // Generate random indices for each name type
            if (typeFirst && currentFirstNamesTh && currentFirstNamesTh.length > 0) {
                firstNameIndex = Math.floor(Math.random() * Math.min(currentFirstNamesTh.length, currentFirstNamesEn.length));
            }
            if (typeLast && allLastNamesTh && allLastNamesTh.length > 0) {
                lastNameIndex = Math.floor(Math.random() * Math.min(allLastNamesTh.length, allLastNamesEn.length));
            }
            if (typeNickname && currentNicknamesTh && currentNicknamesTh.length > 0) {
                nicknameIndex = Math.floor(Math.random() * Math.min(currentNicknamesTh.length, currentNicknamesEn.length));
            }

            // Build name parts
            let thFirstNamePart = "", enFirstNamePart = "";
            let thLastNamePart = "", enLastNamePart = "";
            let thNicknamePart = "", enNicknamePart = "";

            if (firstNameIndex >= 0) {
                const firstName = getCorrespondingName(currentFirstNamesTh, currentFirstNamesEn, firstNameIndex);
                thFirstNamePart = firstName.th;
                enFirstNamePart = firstName.en;
            }

            if (lastNameIndex >= 0) {
                const lastName = getCorrespondingName(allLastNamesTh, allLastNamesEn, lastNameIndex);
                thLastNamePart = lastName.th;
                enLastNamePart = lastName.en;
            }

            if (nicknameIndex >= 0) {
                const nickname = getCorrespondingName(currentNicknamesTh, currentNicknamesEn, nicknameIndex);
                thNicknamePart = nickname.th;
                enNicknamePart = nickname.en;
            }

            // Construct final names
            if (langTh) {
                let combinedTh = [thFirstNamePart, thLastNamePart].filter(Boolean).join(' ');
                if (thNicknamePart) {
                    combinedTh = combinedTh ? `${combinedTh} (${thNicknamePart})` : `(${thNicknamePart})`;
                }
                if (combinedTh) thNameParts.push(combinedTh);
            }

            if (langEn) {
                let combinedEn = [enFirstNamePart, enLastNamePart].filter(Boolean).join(' ');
                if (enNicknamePart) {
                    combinedEn = combinedEn ? `${combinedEn} (${enNicknamePart})` : `(${enNicknamePart})`;
                }
                if (combinedEn) enNameParts.push(combinedEn);
            }
            
            if (thNameParts.length === 0 && enNameParts.length === 0) return "";
            
            // If both languages are selected, show them on the same line separated by " | "
            if (langTh && langEn && thNameParts.length > 0 && enNameParts.length > 0) {
                return `${thNameParts[0]} | ${enNameParts[0]}`;
            }
            
            return thNameParts.concat(enNameParts).join(', ');
        }

        async function generateNames() {
            const countInput = document.getElementById('nameCount');
            const count = parseInt(countInput.value);
            const generateBtn = document.getElementById('generateNameBtn');

            const langTh = document.getElementById('nameLangTh').checked;
            const langEn = document.getElementById('nameLangEn').checked;
            const typeFirst = document.getElementById('nameTypeFirst').checked;
            const typeLast = document.getElementById('nameTypeLast').checked;
            const typeNickname = document.getElementById('nameTypeNickname').checked;


            if (!(langTh || langEn) || !(typeFirst || typeLast || typeNickname)) {
                showNotification('กรุณาเลือกภาษาและประเภทของชื่ออย่างน้อยหนึ่งอย่าง', 'warning');
                nameResults = []; 
                updateNameResultsDisplay(nameResults);
                return;
            }
            
            if (allLastNamesTh.length === 0 && allFirstNamesTh.length === 0 && allNicknamesTh.length === 0 && (typeFirst || typeLast || typeNickname)) {
                 showNotification('ข้อมูลชื่อกำลังโหลดหรือโหลดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', 'warning');
                return;
            }


            if (!count || count <= 0 || count > 1000) {
                showNotification('กรุณาระบุจำนวนระหว่าง 1-1000', 'warning');
                return;
            }

            generateBtn.classList.add('loading');
            generateBtn.innerHTML = '⏳ กำลังสร้าง...';
            generateBtn.disabled = true;

            const resultArea = document.getElementById('nameResultArea');
            resultArea.value = '';

            const newNames = [];
            for (let i = 0; i < count; i++) {
                const nameEntry = createRandomName();
                if (nameEntry) { 
                    newNames.push(nameEntry);
                }
                 if ((i + 1) % 20 === 0 || (i + 1) === count) { 
                    updateNameResultsDisplay(newNames);
                    await new Promise(resolve => setTimeout(resolve, 1));
                }
            }
            nameResults = newNames.filter(name => name.trim() !== ""); // Filter out empty strings again just in case
            updateNameResultsDisplay(nameResults);
            if (nameResults.length > 0) {
                await autoCopyResults(nameResults.join('\n'), `สร้างและคัดลอกชื่อสำเร็จ ${nameResults.length} ชื่อ 📋`);
            }
            
            generateBtn.classList.remove('loading');
            generateBtn.innerHTML = '👤 สุ่มชื่อ';
            generateBtn.disabled = false;
        }

        function updateNameResultsDisplay(namesToDisplay) {
            const resultArea = document.getElementById('nameResultArea');
            const generatedCount = document.getElementById('nameGeneratedCount');
            resultArea.value = namesToDisplay.join('\n'); 
            generatedCount.textContent = namesToDisplay.length.toLocaleString();
        }

        function copyNameResults() {
            if (nameResults.length === 0) {
                showNotification('ยังไม่มีชื่อที่สุ่ม!', 'warning');
                return;
            }
            copyToClipboard(nameResults.join('\n'), `คัดลอกชื่อสำเร็จ ${nameResults.length} ชื่อ`);
        }

        function clearNameResults() {
            if (nameResults.length === 0) {
                showNotification('ไม่มีข้อมูลให้ล้าง', 'warning');
                return;
            }
            if (confirm(`คุณต้องการล้างผลลัพธ์ ${nameResults.length} ชื่อ หรือไม่?`)) {
                nameResults = [];
                document.getElementById('nameResultArea').value = '';
                document.getElementById('nameGeneratedCount').textContent = '0';
                showNotification('ล้างผลลัพธ์ชื่อสำเร็จ', 'success');
            }
        }

        // --- Random Custom Number Functions ---
        function createCustomRandomNumber(length) {
            let number = '';
            const digits = '0123456789';
            for (let i = 0; i < length; i++) {
                number += digits.charAt(Math.floor(Math.random() * digits.length));
            }
            return number;
        }

        async function generateCustomNumbers() {
            const countInput = document.getElementById('customNumberCount');
            const lengthInput = document.getElementById('customNumberLength');
            const count = parseInt(countInput.value);
            const length = parseInt(lengthInput.value);
            const generateBtn = document.getElementById('generateCustomNumberBtn');

            if (!count || count <= 0 || count > 1000) {
                showNotification('กรุณาระบุจำนวนระหว่าง 1-1000', 'warning');
                return;
            }
            if (!length || length <= 0 || length > 50) { 
                showNotification('กรุณาระบุความยาวระหว่าง 1-50', 'warning');
                return;
            }
            generateBtn.classList.add('loading');
            generateBtn.innerHTML = '⏳ กำลังสร้าง...';
            generateBtn.disabled = true;
            const resultArea = document.getElementById('customNumberResultArea');
            resultArea.value = '';
            const newNumbers = [];
            for (let i = 0; i < count; i++) {
                newNumbers.push(createCustomRandomNumber(length));
                 if ((i + 1) % 50 === 0 || (i + 1) === count) {
                    updateCustomNumberResultsDisplay(newNumbers);
                    await new Promise(resolve => setTimeout(resolve, 1));
                }
            }
            customNumberResults = newNumbers;
            updateCustomNumberResultsDisplay(customNumberResults);
            if (customNumberResults.length > 0) {
                 await autoCopyResults(customNumberResults.join('\n'), `สร้างและคัดลอกเลขสำเร็จ ${customNumberResults.length} ตัว 📋`);
            }
            generateBtn.classList.remove('loading');
            generateBtn.innerHTML = '🔢 สุ่มเลข';
            generateBtn.disabled = false;
        }

        function updateCustomNumberResultsDisplay(numbersToDisplay) {
            const resultArea = document.getElementById('customNumberResultArea');
            const generatedCount = document.getElementById('customNumberGeneratedCount');
            resultArea.value = numbersToDisplay.join('\n');
            generatedCount.textContent = numbersToDisplay.length.toLocaleString();
        }

        function copyCustomNumberResults() {
            if (customNumberResults.length === 0) {
                showNotification('ยังไม่มีเลขที่สุ่ม!', 'warning');
                return;
            }
            copyToClipboard(customNumberResults.join('\n'), `คัดลอกเลขสำเร็จ ${customNumberResults.length} ตัว`);
        }

        function clearCustomNumberResults() {
             if (customNumberResults.length === 0) {
                showNotification('ไม่มีข้อมูลให้ล้าง', 'warning');
                return;
            }
            if (confirm(`คุณต้องการล้างผลลัพธ์ ${customNumberResults.length} เลข หรือไม่?`)) {
                customNumberResults = [];
                document.getElementById('customNumberResultArea').value = '';
                document.getElementById('customNumberGeneratedCount').textContent = '0';
                showNotification('ล้างผลลัพธ์เลขสำเร็จ', 'success');
            }
        }
        
        // --- Shared Functions ---
        async function autoCopyResults(textToCopy, successMessage) {
            if (!textToCopy) return;
            try {
                await navigator.clipboard.writeText(textToCopy);
                showNotification(successMessage, 'success');
            } catch (error) {
                const tempTextArea = document.createElement('textarea');
                tempTextArea.value = textToCopy;
                document.body.appendChild(tempTextArea);
                tempTextArea.select();
                try {
                    document.execCommand('copy');
                    showNotification(successMessage, 'success');
                } catch (err) {
                    showNotification('คัดลอกอัตโนมัติไม่สำเร็จ โปรดคัดลอกด้วยตนเอง', 'warning');
                }
                document.body.removeChild(tempTextArea);
            }
        }

        function copyToClipboard(textToCopy, successMessage) {
             if (!textToCopy) {
                showNotification('ไม่มีข้อมูลให้คัดลอก', 'warning');
                return;
            }
            navigator.clipboard.writeText(textToCopy).then(() => {
                showNotification(successMessage, 'success');
            }).catch(() => {
                const tempTextArea = document.createElement('textarea');
                tempTextArea.value = textToCopy;
                document.body.appendChild(tempTextArea);
                tempTextArea.select();
                document.execCommand('copy');
                document.body.removeChild(tempTextArea);
                showNotification(successMessage, 'success');
            });
        }

        function showNotification(message, type = 'success') {
            const existingNotification = document.querySelector('.notification');
            if (existingNotification) existingNotification.remove();
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            document.body.appendChild(notification);
            setTimeout(() => notification.classList.add('show'), 100);
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => { if (notification.parentNode) notification.remove(); }, 300);
            }, 4000);
        }

        // --- Event Listeners ---
        function setupInputValidation(inputId) {
            const inputElement = document.getElementById(inputId);
            if (inputElement) {
                inputElement.addEventListener('input', function(e) {
                    if (parseInt(e.target.value) < 0) e.target.value = Math.abs(parseInt(e.target.value));
                    const maxVal = parseInt(e.target.max);
                    if (maxVal && parseInt(e.target.value) > maxVal) e.target.value = maxVal;
                });
            }
        }
        
        ['thaiIdCount', 'guidCount', 'nameCount', 'customNumberCount', 'customNumberLength'].forEach(setupInputValidation);

        document.getElementById('thaiIdCount').addEventListener('keypress', function(e) { if (e.key === 'Enter') generateThaiIds(); });
        document.getElementById('guidCount').addEventListener('keypress', function(e) { if (e.key === 'Enter') generateGuids(); });
        document.getElementById('nameCount').addEventListener('keypress', function(e) { if (e.key === 'Enter') generateNames(); });
        document.getElementById('customNumberCount').addEventListener('keypress', function(e) { if (e.key === 'Enter') generateCustomNumbers(); });
        document.getElementById('customNumberLength').addEventListener('keypress', function(e) { if (e.key === 'Enter') generateCustomNumbers(); });

        ['upperCase', 'withBraces', 'withoutHyphens'].forEach(id => {
            document.getElementById(id).addEventListener('change', function() {
                if (guidResults.length > 0) updateGuidResultsDisplay(guidResults); 
            });
        });
        
        document.addEventListener('DOMContentLoaded', loadNameData);
