              const defaultVocabulary = {
            income: ['job', 'salary', 'wage', 'pay', 'bonus', 'dividend', 'profit', 'sales', 'freelance', 'commission', 'grant', 'allowance', 'payout', 'interest earned', 'royalty', 'gig', 'airdrop', 'staking rewards', 'gift money', 'funding', 'refund', 'reimbursement', 'side hustle', 'tips', 'revenue', 'earnings'],
            asset: ['house', 'stock', 'bond', 'crypto', 'bitcoin', 'gold', 'real estate', 'land', 'investment', 'savings', 'equity', 'fund', 'property', 'ethereum', 'solana', 'usdt', 'portfolio', 'share', 'cash account', 'forex balance', 'nft', 'equipment', 'machinery', 'vehicle', 'car asset', 'gold bars', 'silver', 'wallet balance'],
            liability: ['loan', 'debt', 'mortgage', 'credit', 'borrow', 'overdraft', 'owe', 'paylater', 'leverage margin', 'funding fee debt', 'bill outstanding', 'dues', 'arrears', 'taxes owed', 'pawn'],
            expense: ['food', 'clothes', 'rent', 'gas', 'car', 'utility', 'bill', 'grocery', 'groceries', 'subscription', 'tax', 'fee', 'fees', 'shoe', 'shirt', 'jacket', 'meal', 'restaurant', 'transport', 'wifi', 'internet', 'electricity', 'water', 'insurance', 'entertainment', 'movie', 'game', 'software', 'hosting', 'domain', 'data bundle', 'airtime', 'credit unit', 'snacks', 'drinks', 'lunch', 'dinner', 'uber', 'bolt', 'repairs', 'maintenance']
        };

        const defaultPreferences = {
            theme: 'dark',
            radius: '12px',
            scalingFactor: '0.15',
            currency: 'GHS'
        };

        let systemVocab = JSON.parse(localStorage.getItem('sys_vocabulary')) || defaultVocabulary;
        let systemPrefs = JSON.parse(localStorage.getItem('sys_preferences')) || defaultPreferences;
        let systemGoals = JSON.parse(localStorage.getItem('sys_goals')) || [];
        let calcClearOnNextInput = false;
        let formatter; 

        function updateFormatter() {
            const currencyConfig = {
                'GHS': { locale: 'en-GH', code: 'GHS', symbol: 'GH₵' },
                'USD': { locale: 'en-US', code: 'USD', symbol: '$' },
                'EUR': { locale: 'de-DE', code: 'EUR', symbol: '€' },
                'GBP': { locale: 'en-GB', code: 'GBP', symbol: '£' }
            };
            const config = currencyConfig[systemPrefs.currency] || currencyConfig['GHS'];
            
            formatter = {
                format: function(value) {
                    const num = Number(value) || 0;
                    const standardFormatted = new Intl.NumberFormat(config.locale, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                    }).format(num);
                    
                    if (config.code === 'GHS') {
                        return `GH₵${standardFormatted}`;
                    }
                    const nativeIntl = new Intl.NumberFormat(config.locale, { style: 'currency', currency: config.code });
                    return nativeIntl.format(num);
                }
            };
        }

        const inputs = document.querySelectorAll('input[type="number"]');
        const rootContainer = document.documentElement;
        
        const ui = {
            assets: document.getElementById('assets'),
            liabilities: document.getElementById('liabilities'),
            income: document.getElementById('income'),
            expenses: document.getElementById('expenses'),
            pocketMoney: document.getElementById('pocketMoney'),
            savedMoney: document.getElementById('savedMoney'),
            logDate: document.getElementById('logDate'),
            barAsset: document.getElementById('barAsset'),
            barIncome: document.getElementById('barIncome'),
            barExpense: document.getElementById('barExpense'),
            barLiability: document.getElementById('barLiability'),
            pctAsset: document.getElementById('pctAsset'),
            pctIncome: document.getElementById('pctIncome'),
            pctExpense: document.getElementById('pctExpense'),
            pctLiability: document.getElementById('pctLiability'),
            sketchIncome: document.getElementById('sketchIncome'),
            sketchExpenses: document.getElementById('sketchExpenses'),
            sketchAssets: document.getElementById('sketchAssets'),
            sketchLiabilities: document.getElementById('sketchLiabilities'),
            nwDisplay: document.getElementById('netWorthDisplay'),
            nwStatus: document.getElementById('netWorthStatus'),
            niDisplay: document.getElementById('netIncomeDisplay'),
            niStatus: document.getElementById('netIncomeStatus'),
            advisorPanel: document.getElementById('blueprintContent'),
            historyBody: document.getElementById('historyBody')
        };

        ui.logDate.value = new Date().toISOString().split('T')[0];

        function switchTab(targetViewId, element) {
            const panels = document.querySelectorAll('.view-panel');
            const tabs = document.querySelectorAll('.nav-tab');
            
            tabs.forEach(tab => tab.classList.remove('active'));
            element.classList.add('active');

            panels.forEach(panel => {
                if(panel.classList.contains('active')) {
                    panel.style.opacity = '0';
                    panel.style.transform = 'translateY(10px)';
                    setTimeout(() => { panel.classList.remove('active'); }, 200);
                }
            });

            setTimeout(() => {
                const targetPanel = document.getElementById(targetViewId);
                targetPanel.classList.add('active');
                setTimeout(() => {
                    targetPanel.style.opacity = '1';
                    targetPanel.style.transform = 'translateY(0)';
                }, 50);
            }, 200);

            if(targetViewId === 'adminView') {
                renderVocabularyTags();
                syncPreferencesUIElements();
            }
            if(targetViewId === 'successView') {
                calculateSuccessMetrics();
            }
        }

        function renderVocabularyTags() {
            const currentDeck = document.getElementById('vocabExplorerFilter').value;
            const container = document.getElementById('vocabDeckTags');
            container.innerHTML = '';

            systemVocab[currentDeck].forEach((word, index) => {
                const tag = document.createElement('span');
                tag.className = 'keyword-tag';
                
                const labelNode = document.createTextNode(word + " ");
                tag.appendChild(labelNode);
                
                const delBtn = document.createElement('button');
                delBtn.textContent = 'x';
                delBtn.onclick = function() { deleteKeyword(currentDeck, index); };
                
                tag.appendChild(delBtn);
                container.appendChild(tag);
            });
        }

        function addNewKeyword() {
            const category = document.getElementById('vocabTargetCategory').value;
            const textInput = document.getElementById('newVocabWord');
            const targetWord = textInput.value.toLowerCase().trim();

            if(!targetWord) return alert("Please type a valid word.");
            if(systemVocab[category].includes(targetWord)) return alert("Keyword allocation exists.");

            systemVocab[category].push(targetWord);
            localStorage.setItem('sys_vocabulary', JSON.stringify(systemVocab));
            textInput.value = '';
            
            document.getElementById('vocabTargetCategory').value = category;
            renderVocabularyTags();
        }

        function deleteKeyword(category, index) {
            const word = systemVocab[category][index];
            if (confirm(`Are you sure you want to delete "${word}" from the vocabulary list?`)) {
                systemVocab[category].splice(index, 1);
                localStorage.setItem('sys_vocabulary', JSON.stringify(systemVocab));
                renderVocabularyTags();
            }
        }

        function syncPreferencesUIElements() {
            document.getElementById('siteThemeSelector').value = systemPrefs.theme;
            document.getElementById('siteRadiusSelector').value = systemPrefs.radius;
            document.getElementById('scalingFactorSelector').value = systemPrefs.scalingFactor;
            document.getElementById('siteCurrencySelector').value = systemPrefs.currency || 'GHS';
        }

        function commitAndSecurePreferences() {
            systemPrefs.theme = document.getElementById('siteThemeSelector').value;
            systemPrefs.radius = document.getElementById('siteRadiusSelector').value;
            systemPrefs.scalingFactor = document.getElementById('scalingFactorSelector').value;
            systemPrefs.currency = document.getElementById('siteCurrencySelector').value;

            localStorage.setItem('sys_preferences', JSON.stringify(systemPrefs));
            applyPreferencesEngineState();
            alert("System security profile settings applied successfully.");
        }

        function applyPreferencesEngineState() {
            const smartLabelEl = document.getElementById('smartLabel');
            smartLabelEl.textContent = 'Smart Classifier Input';

            rootContainer.style.setProperty('--radius-main', systemPrefs.radius);
            rootContainer.style.setProperty('--radius-inner', systemPrefs.radius === '0px' ? '0px' : '6px');

            if(systemPrefs.theme === 'light') {
                rootContainer.style.setProperty('--bg-color', '#f6f8fa');
                rootContainer.style.setProperty('--surface-color', 'rgba(255, 255, 255, 0.95)');
                rootContainer.style.setProperty('--bg-input', '#ffffff');
                rootContainer.style.setProperty('--border-color', '#d0d7de');
                rootContainer.style.setProperty('--text-primary', '#24292f');
                rootContainer.style.setProperty('--text-secondary', '#57606a');
            } else {
                rootContainer.style.setProperty('--bg-color', '#0a0c10');
                rootContainer.style.setProperty('--surface-color', 'rgba(22, 27, 34, 0.75)');
                rootContainer.style.setProperty('--bg-input', 'rgba(1, 4, 9, 0.6)');
                rootContainer.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.08)');
                rootContainer.style.setProperty('--text-primary', '#c9d1d9');
                rootContainer.style.setProperty('--text-secondary', '#8b949e');
            }
            
            updateFormatter();
            calculateAndCompare();
            renderHistoryTable();
            calculateSuccessMetrics();
        }

        function classifyItem() {
            const itemName = document.getElementById('smartItem').value.toLowerCase().trim();
            const amount = parseFloat(document.getElementById('smartAmount').value);
            const resultDiv = document.getElementById('classificationResult');

            resultDiv.innerHTML = '';
            if (!itemName || isNaN(amount) || amount <= 0) {
                resultDiv.style.backgroundColor = "rgba(218, 54, 51, 0.1)";
                const errSpan = document.createElement('span');
                errSpan.style.color = "var(--color-liability)";
                errSpan.textContent = "Please enter a valid item name and amount.";
                resultDiv.appendChild(errSpan);
                return;
            }

            let category = "Expense"; 
            let color = "var(--color-expense)";
            let targetInput = ui.expenses;
            let explanation = "";

            if (systemVocab.income.some(kw => itemName.includes(kw))) {
                category = "Income"; color = "var(--color-income)"; targetInput = ui.income;
                explanation = `This is classified as Income because it represents an inbound inflow or influx of capital increasing overall cash reservoirs. Tip: Funnel a fixed ratio of this entry directly to purchase assets!`;
            } else if (systemVocab.asset.some(kw => itemName.includes(kw))) {
                category = "Asset"; color = "var(--color-asset)"; targetInput = ui.assets;
                explanation = `This is classified as an Asset because it holds future value retrieval property equity options or builds yield. Tip: Protect your asset holdings; these act as engines multiplying long term security layouts.`;
            } else if (systemVocab.liability.some(kw => itemName.includes(kw))) {
                category = "Liability"; color = "var(--color-liability)"; targetInput = ui.liabilities;
                explanation = `This is classified as a Liability because it is an outstanding financial commitment or leverage drag drawing value backwards. Tip: Prioritize extra balances into erasing liabilities early to avoid structural performance compound friction fees.`;
            } else {
                category = "Expense"; color = "var(--color-expense)"; targetInput = ui.expenses;
                if(itemName.includes("food") || itemName.includes("grocery") || itemName.includes("groceries") || itemName.includes("restaurant")) {
                    explanation = `This is classified as an Expense because it's a consumption cost where money leaves without returning equity. Try planning weekly bulk meal preps, setting an explicit budget cap before tracking checkout menus, or cutting down high restaurant markups to preserve structural cash balance velocity.`;
                } else {
                    explanation = `This is classified as an Expense because it tracks immediate outflow and lifestyle consumption drain metrics. Tip: Review recurring components to see if they can be minimized or substituted for long term gains.`;
                }
            }

            const currentVal = parseFloat(targetInput.value) || 0;
            targetInput.value = (currentVal + amount).toFixed(2);
            
            calculateAndCompare();

            resultDiv.style.backgroundColor = "rgba(255,255,255,0.03)";
            resultDiv.style.border = `1px solid ${color}`;
            
            const headDiv = document.createElement('div');
            headDiv.style.marginBottom = "0.3rem";
            headDiv.appendChild(document.createTextNode("Categorized as "));
            
            const badgeSpan = document.createElement('span');
            badgeSpan.style.color = color;
            badgeSpan.style.textTransform = "uppercase";
            badgeSpan.style.fontWeight = "900";
            badgeSpan.textContent = category;
            
            headDiv.appendChild(badgeSpan);
            headDiv.appendChild(document.createTextNode(`. Added ${formatter.format(amount)} to systems profile.`));
            
            const bodyDiv = document.createElement('div');
            bodyDiv.style.fontSize = "0.8rem";
            bodyDiv.style.fontWeight = "normal";
            bodyDiv.style.color = "var(--text-secondary)";
            bodyDiv.style.lineHeight = "1.4";
            bodyDiv.textContent = explanation;
            
            resultDiv.appendChild(headDiv);
            resultDiv.appendChild(bodyDiv);
            
            document.getElementById('smartItem').value = '';
            document.getElementById('smartAmount').value = '';
        }

        function calculateAndCompare() {
            const pocket = parseFloat(ui.pocketMoney.value) || 0;
            const saved = parseFloat(ui.savedMoney.value) || 0;
            
            const baseAssets = parseFloat(ui.assets.value) || 0;
            const assets = baseAssets + pocket + saved;
            
            const liabilities = parseFloat(ui.liabilities.value) || 0;
            const income = parseFloat(ui.income.value) || 0;
            const expenses = parseFloat(ui.expenses.value) || 0;

            ui.sketchIncome.textContent = formatter.format(income);
            ui.sketchExpenses.textContent = formatter.format(expenses);
            ui.sketchAssets.textContent = formatter.format(assets);
            ui.sketchLiabilities.textContent = formatter.format(liabilities);

            const totalBalanceSheet = assets + liabilities;
            const totalVerticalSum = income + expenses + totalBalanceSheet;
            const padFactor = parseFloat(systemPrefs.scalingFactor) || 0.15;

            const dashboardEl = document.getElementById('dashboardView');
            if (totalVerticalSum === 0) {
                dashboardEl.style.setProperty('--flex-income', '1');
                dashboardEl.style.setProperty('--flex-expenses', '1');
                dashboardEl.style.setProperty('--flex-split', '1');
            } else {
                const baseValue = totalVerticalSum * padFactor;
                dashboardEl.style.setProperty('--flex-income', `${income + baseValue}`);
                dashboardEl.style.setProperty('--flex-expenses', `${expenses + baseValue}`);
                dashboardEl.style.setProperty('--flex-split', `${totalBalanceSheet + baseValue}`);
                
                const horizontalBase = (totalBalanceSheet || 1) * (padFactor * 1.3);
                dashboardEl.style.setProperty('--flex-assets', `${assets + horizontalBase}`);
                dashboardEl.style.setProperty('--flex-liabilities', `${liabilities + horizontalBase}`);
            }

            const grandTotal = assets + liabilities + income + expenses;
            if (grandTotal === 0) {
                ui.barAsset.style.width = ui.barIncome.style.width = ui.barExpense.style.width = ui.barLiability.style.width = '25%';
                ui.pctAsset.textContent = ui.pctIncome.textContent = ui.pctExpense.textContent = ui.pctLiability.textContent = '0%';
            } else {
                const aP = (assets / grandTotal) * 100; const iP = (income / grandTotal) * 100;
                const eP = (expenses / grandTotal) * 100; const lP = (liabilities / grandTotal) * 100;

                ui.barAsset.style.width = `${aP}%`; ui.barIncome.style.width = `${iP}%`;
                ui.barExpense.style.width = `${eP}%`; ui.barLiability.style.width = `${lP}%`;

                ui.pctAsset.textContent = `${aP.toFixed(1)}%`; ui.pctIncome.textContent = `${iP.toFixed(1)}%`;
                ui.pctExpense.textContent = `${eP.toFixed(1)}%`; ui.pctLiability.textContent = `${lP.toFixed(1)}%`;
            }

            const netWorth = assets - liabilities;
            ui.nwDisplay.textContent = formatter.format(netWorth);
            ui.nwDisplay.className = `value ${netWorth > 0 ? 'good' : (netWorth < 0 ? 'bad' : '')}`;
            ui.nwStatus.textContent = netWorth > 0 ? 'Solvent' : (netWorth < 0 ? 'Insolvent' : 'Breakeven');
            ui.nwStatus.className = `status ${netWorth > 0 ? 'good' : (netWorth < 0 ? 'bad' : '')}`;

            const netIncome = income - expenses;
            ui.niDisplay.textContent = formatter.format(netIncome);
            ui.niDisplay.className = `value ${netIncome > 0 ? 'good' : (netIncome < 0 ? 'bad' : '')}`;
            ui.niStatus.textContent = netIncome > 0 ? 'Positive Flow' : (netIncome < 0 ? 'Negative Flow' : 'Breakeven');
            ui.niStatus.className = `status ${netIncome > 0 ? 'good' : (netIncome < 0 ? 'bad' : '')}`;

            ui.advisorPanel.textContent = '';
            const adviceBlocks = generateWealthAdvice(assets, liabilities, income, expenses);
            adviceBlocks.forEach(itemText => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'blueprint-item';
                itemDiv.textContent = itemText;
                ui.advisorPanel.appendChild(itemDiv);
            });
            if(adviceBlocks.length === 0) {
                ui.advisorPanel.textContent = "Enter numbers to isolate exactly which quadrant holds leverage logic runtime properties.";
            }
        }

        function generateWealthAdvice(assets, liabilities, income, expenses) {
            if (assets === 0 && liabilities === 0 && income === 0 && expenses === 0) return [];
            let logs = [];
            if (assets < liabilities) {
                logs.push("Core Balance Sheet Strategy: LIABILITIES BURNDOWN - Obligations dominate asset profiles. Attack basic high-interest drag variables first.");
            } else {
                logs.push("Core Balance Sheet Strategy: ASSET VELOCITY EXPANSION - Solvency metrics are functional. Shift incoming resources into expanding capital asset base layout parameters.");
            }
            if (income < expenses) {
                logs.push("Core Capital Flow Focus: INCOME VELOCITY ENHANCEMENT - Negative structural cash burn tracked. Scale active income streams or optimize baseline commitments.");
            } else {
                logs.push("Core Capital Flow Focus: ASSET CONVERSION PIPELINE - Surplus detected. Automate regular balance sweep out of active currency loops into strategic long positions.");
            }
            return logs;
        }

        function getHistory() { return JSON.parse(localStorage.getItem('wealthDashboardHistory')) || []; }
        
        function saveCurrentDay() {
            const date = ui.logDate.value;
            if (!date) return alert("Select standard valid log date parameter.");
            
            let history = getHistory();
            const existIndex = history.findIndex(i => i.date === date);
            if(existIndex !== -1) {
                if(!confirm(`Overwrite historical entry configuration instance recorded for ${date}?`)) {
                    renderHistoryTable();
                    return;
                }
            }

            const currentTimeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
            const pocket = parseFloat(ui.pocketMoney.value) || 0;
            const saved = parseFloat(ui.savedMoney.value) || 0;
            const baseAssets = parseFloat(ui.assets.value) || 0;
            const calculatedAssets = baseAssets + pocket + saved;
            const liabilities = parseFloat(ui.liabilities.value) || 0;
            
            const entry = {
                id: existIndex !== -1 ? history[existIndex].id : Date.now(),
                date: date,
                timestamp: currentTimeStr, 
                assets: baseAssets,
                pocket: pocket,
                saved: saved,
                calculatedAssets: calculatedAssets,
                liabilities: liabilities,
                income: parseFloat(ui.income.value) || 0,
                expenses: parseFloat(ui.expenses.value) || 0,
                netWorth: calculatedAssets - liabilities
            };

            if(existIndex !== -1) {
                history[existIndex] = entry;
            } else { 
                history.push(entry); 
            }

            history.sort((a, b) => new Date(b.date) - new Date(a.date));
            localStorage.setItem('wealthDashboardHistory', JSON.stringify(history));
            renderHistoryTable();
        }

        function editEntry(id) {
            const entry = getHistory().find(item => item.id === id);
            if (entry) {
                ui.assets.value = entry.assets || ""; 
                ui.liabilities.value = entry.liabilities || "";
                ui.income.value = entry.income || ""; 
                ui.expenses.value = entry.expenses || "";
                ui.pocketMoney.value = entry.pocket || "";
                ui.savedMoney.value = entry.saved || "";
                ui.logDate.value = entry.date;
                calculateAndCompare();
                switchTab('dashboardView', document.querySelectorAll('.nav-tab')[0]);
            }
        }

        function deleteEntry(id) {
            if (confirm("Delete structural entry data block from device memory history tracking tables?")) {
                localStorage.setItem('wealthDashboardHistory', JSON.stringify(getHistory().filter(i => i.id !== id)));
                renderHistoryTable();
                calculateAndCompare();
            }
        }

        function renderHistoryTable() {
            const history = getHistory(); ui.historyBody.innerHTML = "";
            if (history.length === 0) {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.setAttribute('colspan', '8');
                td.style.textAlign = 'center';
                td.style.color = 'var(--text-secondary)';
                td.textContent = 'No historical records logged yet.';
                tr.appendChild(td);
                ui.historyBody.appendChild(tr);
                return;
            }
            history.forEach(item => {
                const r = document.createElement('tr');
                
                const tTime = document.createElement('td');
                tTime.style.color = 'var(--text-secondary)';
                tTime.style.fontSize = '0.8rem';
                tTime.textContent = item.timestamp || 'N/A';
                
                const tDate = document.createElement('td');
                tDate.style.fontWeight = 'bold';
                tDate.style.color = '#ffffff';
                tDate.textContent = item.date;
                
                const tAst = document.createElement('td');
                tAst.style.color = 'var(--color-asset)';
                tAst.textContent = formatter.format(item.calculatedAssets || item.assets);
                
                const tLia = document.createElement('td');
                tLia.style.color = 'var(--color-liability)';
                tLia.textContent = formatter.format(item.liabilities);
                
                const tInc = document.createElement('td');
                tInc.style.color = 'var(--color-income)';
                tInc.textContent = formatter.format(item.income);
                
                const tExp = document.createElement('td');
                tExp.style.color = 'var(--color-expense)';
                tExp.textContent = formatter.format(item.expenses);
                
                const tNw = document.createElement('td');
                tNw.className = item.netWorth >= 0 ? 'good' : 'bad';
                tNw.style.fontWeight = 'bold';
                tNw.textContent = formatter.format(item.netWorth);
                
                const tAct = document.createElement('td');
                const eBtn = document.createElement('button');
                eBtn.className = 'btn-action edit-mode';
                eBtn.textContent = 'Edit';
                eBtn.onclick = function() { editEntry(item.id); };
                
                const dBtn = document.createElement('button');
                dBtn.className = 'btn-action';
                dBtn.textContent = 'Delete';
                dBtn.style.marginLeft = '4px';
                dBtn.onclick = function() { deleteEntry(item.id); };
                
                tAct.appendChild(eBtn);
                tAct.appendChild(dBtn);
                
                r.appendChild(tTime);
                r.appendChild(tDate);
                r.appendChild(tAst);
                r.appendChild(tLia);
                r.appendChild(tInc);
                r.appendChild(tExp);
                r.appendChild(tNw);
                r.appendChild(tAct);
                
                ui.historyBody.appendChild(r);
            });
        }

        function saveSystemGoal() {
            const type = document.getElementById('goalType').value;
            const amount = parseFloat(document.getElementById('goalAmount').value);
            
            if (isNaN(amount) || amount <= 0) return alert("Please specify a valid numeric objective threshold.");
            
            const newGoal = { id: Date.now(), type, amount };
            systemGoals.push(newGoal);
            localStorage.setItem('sys_goals', JSON.stringify(systemGoals));
            document.getElementById('goalAmount').value = '';
            calculateSuccessMetrics();
        }

        function deleteGoal(id) {
            systemGoals = systemGoals.filter(g => g.id !== id);
            localStorage.setItem('sys_goals', JSON.stringify(systemGoals));
            calculateSuccessMetrics();
        }

        function calculateSuccessMetrics() {
            const history = getHistory();
            
            const deltaValEl = document.getElementById('deltaValue');
            const deltaStatusEl = document.getElementById('deltaStatus');
            if(!deltaValEl || !deltaStatusEl) return;
            
            if (history.length >= 2) {
                const currentDayNW = history[0].netWorth;
                const previousDayNW = history[1].netWorth;
                const netDelta = currentDayNW - previousDayNW;
                
                deltaValEl.textContent = formatter.format(netDelta);
                if(netDelta > 0) {
                    deltaValEl.className = "value good";
                    deltaStatusEl.textContent = `Gained ground compared to your previous entry on ${history[1].date}.`;
                } else if(netDelta < 0) {
                    deltaValEl.className = "value bad";
                    deltaStatusEl.textContent = `Loss tracked compared to your previous entry on ${history[1].date}.`;
                } else {
                    deltaValEl.className = "value";
                    deltaStatusEl.textContent = `Perfect performance equilibrium maintained since ${history[1].date}.`;
                }
            } else {
                deltaValEl.textContent = formatter.format(0);
                deltaValEl.className = "value";
                deltaStatusEl.textContent = "Log at least two individual dates inside your history grid to compute progress steps.";
            }

            const pocket = parseFloat(ui.pocketMoney.value) || 0;
            const saved = parseFloat(ui.savedMoney.value) || 0;
            const assets = (parseFloat(ui.assets.value) || 0) + pocket + saved;
            const liabilities = parseFloat(ui.liabilities.value) || 0;
            const income = parseFloat(ui.income.value) || 0;
            const expenses = parseFloat(ui.expenses.value) || 0;

            let score = 50; 
            if (assets > liabilities) score += 15; else if (assets < liabilities) score -= 15;
            if (income > expenses) score += 15; else if (income < expenses) score -= 15;
            if (saved > 0 || pocket > 0) score += 10;
            if (score > 100) score = 100; if (score < 0) score = 0;

            document.getElementById('scoreValue').textContent = `${score} / 100`;
            const statusEl = document.getElementById('scoreStatus');
            if(score >= 75) { statusEl.textContent = "Excellent Health Profile Stability"; statusEl.className = "status good"; }
            else if(score >= 45) { statusEl.textContent = "Standard Operational Baseline Standing"; statusEl.className = "status"; }
            else { statusEl.textContent = "Vulnerable Leverage Exposure Detected"; statusEl.className = "status bad"; }

            const container = document.getElementById('activeGoalsDisplay');
            container.innerHTML = '';
            
            if(systemGoals.length === 0) {
                container.textContent = "No targets configured yet. Set one above!";
                container.style.fontSize = "0.85rem";
                container.style.color = "var(--text-secondary)";
                container.style.textAlign = "center";
                return;
            }

            systemGoals.forEach(goal => {
                let currentActual = 0;
                let titleLabel = "";
                
                if (goal.type === "netWorth") {
                    currentActual = assets - liabilities;
                    titleLabel = "Net Worth Goal";
                } else if (goal.type === "savings") {
                    currentActual = saved;
                    titleLabel = "Money Saved Goal";
                } else if (goal.type === "expenses") {
                    currentActual = expenses;
                    titleLabel = "Expense Ceiling Cap";
                }

                let pct = 0;
                if(goal.type === "expenses") {
                    pct = goal.amount > 0 ? Math.max(0, ((goal.amount - currentActual) / goal.amount) * 100) : 0;
                } else {
                    pct = goal.amount > 0 ? Math.min(100, (currentActual / goal.amount * 100)) : 0;
                }
                if (pct < 0) pct = 0;

                const card = document.createElement('div');
                card.style.backgroundColor = "rgba(0,0,0,0.2)";
                card.style.padding = "0.6rem";
                card.style.borderRadius = "6px";
                card.style.border = "1px solid var(--border-color)";
                card.style.display = "flex";
                card.style.flexDirection = "column";
                card.style.gap = "0.25rem";

                const rowWrap = document.createElement('div');
                rowWrap.style.display = 'flex';
                rowWrap.style.justifyContent = 'space-between';
                rowWrap.style.fontSize = '0.85rem';
                rowWrap.style.fontWeight = 'bold';
                
                const tSpan = document.createElement('span');
                tSpan.textContent = `${titleLabel}: ${formatter.format(goal.amount)}`;
                
                const rBtn = document.createElement('button');
                rBtn.className = 'btn-action';
                rBtn.textContent = 'Remove';
                rBtn.onclick = function() { deleteGoal(goal.id); };
                
                rowWrap.appendChild(tSpan);
                rowWrap.appendChild(rBtn);

                const labelSub = document.createElement('div');
                labelSub.style.fontSize = '0.75rem';
                labelSub.style.color = 'var(--text-secondary)';
                labelSub.textContent = `Current Actual Level: ${formatter.format(currentActual)} (${pct.toFixed(1)}% Room Remaining / Optimality Match)`;

                const barBg = document.createElement('div');
                barBg.style.width = '100%';
                barBg.style.height = '6px';
                barBg.style.background = 'rgba(255,255,255,0.05)';
                barBg.style.borderRadius = '3px';
                barBg.style.overflow = 'hidden';

                const barFill = document.createElement('div');
                barFill.style.width = pct + '%';
                barFill.style.height = '100%';
                
                if (goal.type === "expenses") {
                    barFill.style.background = pct <= 15 ? 'var(--color-liability)' : 'var(--color-asset)';
                } else {
                    barFill.style.background = pct >= 100 ? 'var(--color-asset)' : 'var(--color-income)';
                }
                barFill.style.transition = 'width 0.4s';
                
                barBg.appendChild(barFill);
                card.appendChild(rowWrap);
                card.appendChild(labelSub);
                card.appendChild(barBg);
                
                container.appendChild(card);
            });
        }

        let calcExpression = "";
        
        function pressNum(num) {
            const screen = document.getElementById('calcScreen');
            if (screen.textContent === "0" && num !== "." || calcClearOnNextInput) {
                calcExpression = "";
                calcClearOnNextInput = false;
            }
            if (num === "." && calcExpression.split(/[\+\-\*\/]/).pop().includes(".")) return;
            calcExpression += num;
            screen.textContent = calcExpression;
        }
        
        function pressOp(op) {
            calcClearOnNextInput = false;
            if (!calcExpression) {
                if (op === "-") calcExpression = "-";
                return;
            }
            const lastChar = calcExpression.trim().slice(-1);
            if (["+", "-", "*", "/"].includes(lastChar)) {
                calcExpression = calcExpression.trim().slice(0, -1) + op;
            } else {
                calcExpression += op;
            }
            document.getElementById('calcScreen').textContent = calcExpression;
        }
        
        function clearCalc() {
            calcExpression = "";
            document.getElementById('calcScreen').textContent = "0";
            calcClearOnNextInput = false;
        }
        
        function runCalc() {
            const screen = document.getElementById('calcScreen');
            try {
                const sanitized = calcExpression.replace(/[^0-9\+\-\*\/\.]/g, '');
                if (!sanitized) return;
                
                const computed = Function(`"use strict"; return (${sanitized})`)();
                if (computed === Infinity || isNaN(computed)) {
                    screen.textContent = "Error";
                    calcExpression = "";
                } else {
                    screen.textContent = Number(computed.toFixed(4));
                    calcExpression = computed.toString();
                }
            } catch(e) {
                screen.textContent = "Error";
                calcExpression = "";
            }
            calcClearOnNextInput = true;
        }

        function triggerSystemFactoryReset() {
            if(confirm("CRITICAL INTERVENTION: This resets all custom vocabulary sets, UI layout states, and logs. Proceed?")) {
                localStorage.clear();
                systemVocab = defaultVocabulary; systemPrefs = defaultPreferences; systemGoals = [];
                applyPreferencesEngineState();
                switchTab('dashboardView', document.querySelectorAll('.nav-tab')[0]);
            }
        }

        function exportSystemData() {
            const exportData = {
                sys_vocabulary: JSON.parse(localStorage.getItem('sys_vocabulary')) || defaultVocabulary,
                sys_preferences: JSON.parse(localStorage.getItem('sys_preferences')) || defaultPreferences,
                sys_goals: JSON.parse(localStorage.getItem('sys_goals')) || [],
                wealthDashboardHistory: JSON.parse(localStorage.getItem('wealthDashboardHistory')) || []
            };
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `financial_dashboard_backup_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        }

        function importSystemData(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const imported = JSON.parse(e.target.result);
                    if (imported.sys_vocabulary) localStorage.setItem('sys_vocabulary', JSON.stringify(imported.sys_vocabulary));
                    if (imported.sys_preferences) localStorage.setItem('sys_preferences', JSON.stringify(imported.sys_preferences));
                    if (imported.sys_goals) localStorage.setItem('sys_goals', JSON.stringify(imported.sys_goals));
                    if (imported.wealthDashboardHistory) localStorage.setItem('wealthDashboardHistory', JSON.stringify(imported.wealthDashboardHistory));
                    
                    alert("Data imported successfully! The page will now reload.");
                    location.reload();
                } catch (err) {
                    alert("Failed to parse import file. Ensure it is a valid JSON backup.");
                }
            };
            reader.readAsText(file);
        }

        window.onload = function() { applyPreferencesEngineState(); };
        inputs.forEach(i => i.addEventListener('input', calculateAndCompare));
        (function addMultiDayComparison() {
            const successGrid = document.querySelector('#successView .success-metrics-grid');
            if (!successGrid) return;

            const multiDayCard = document.createElement('div');
            multiDayCard.className = 'result-card';
            multiDayCard.id = 'multiDayComparisonCard';
            
            multiDayCard.innerHTML = `
                <h3 style="color:var(--text-secondary); font-size:0.85rem;">7-Day Rolling Financial Shift</h3>
                <div class="value" id="multiDayDeltaValue">GH₵0.00</div>
                <div class="status" id="multiDayDeltaStatus">Awaiting historical depth for a 7-day span.</div>
            `;

            successGrid.appendChild(multiDayCard);

            function updateMultiDayMetrics() {
                const historyData = JSON.parse(localStorage.getItem('wealthDashboardHistory')) || [];
                const valEl = document.getElementById('multiDayDeltaValue');
                const statusEl = document.getElementById('multiDayDeltaStatus');
                
                if (!valEl || !statusEl) return;

                const targetIndex = historyData.length >= 8 ? 7 : historyData.length - 1;

                if (historyData.length >= 2 && targetIndex > 0) {
                    const currentNW = historyData[0].netWorth;
                    const pastNW = historyData[targetIndex].netWorth;
                    const pastDate = historyData[targetIndex].date;
                    
                    const multiDayDelta = currentNW - pastNW;
                    const currentCurrency = JSON.parse(localStorage.getItem('sys_preferences'))?.currency || 'GHS';
                    
                    const currencyConfig = {
                        'GHS': { locale: 'en-GH', code: 'GHS', symbol: 'GH₵' },
                        'USD': { locale: 'en-US', code: 'USD', symbol: '$' },
                        'EUR': { locale: 'de-DE', code: 'EUR', symbol: '€' },
                        'GBP': { locale: 'en-GB', code: 'GBP', symbol: '£' }
                    };
                    const config = currencyConfig[currentCurrency] || currencyConfig['GHS'];
                    
                    const activeFormatter = {
                        format: function(val) {
                            const num = Number(val) || 0;
                            const standardFormatted = new Intl.NumberFormat(config.locale, { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                            }).format(num);
                            
                            if (config.code === 'GHS') {
                                return `GH₵${standardFormatted}`;
                            }
                            return new Intl.NumberFormat(config.locale, { style: 'currency', currency: config.code }).format(num);
                        }
                    };

                    valEl.textContent = activeFormatter.format(multiDayDelta);
                    
                    if (multiDayDelta > 0) {
                        valEl.className = "value good";
                        statusEl.textContent = `Net growth achieved compared to your record from ${pastDate}.`;
                    } else if (multiDayDelta < 0) {
                        valEl.className = "value bad";
                        statusEl.textContent = `Net drawdown tracked compared to your record from ${pastDate}.`;
                    } else {
                        valEl.className = "value";
                        statusEl.textContent = `Net position remained flat since ${pastDate}.`;
                    }
                } else {
                    valEl.textContent = "GH₵0.00";
                    valEl.className = "value";
                    statusEl.textContent = "Log entries across multiple different dates to calculate multi-day trends.";
                }
            }

            updateMultiDayMetrics();
            
            document.querySelectorAll('.nav-tab').forEach((tab, idx) => {
                if (idx === 1) {
                    tab.addEventListener('click', updateMultiDayMetrics);
                }
            });
        })();