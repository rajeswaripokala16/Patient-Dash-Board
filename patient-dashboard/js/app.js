/**
 * Coalition Technologies - Healthcare Dashboard
 * Front End Developer Skills Test
 * Patient Dashboard - Jessica Taylor
 */

// API Configuration
const API_CONFIG = {
    url: 'https://fedskillstest.coalitiontechnologies.workers.dev',
    username: 'coalition',
    password: 'skills-test'
};

// Global variable to store Chart.js instance
let bloodPressureChartInstance = null;

/**
 * Initialize the application
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Healthcare Dashboard Loading...');
    loadPatientData();
});

/**
 * Fetch patient data from API
 */
async function loadPatientData() {
    try {
        // Create Basic Auth header
        const auth = btoa(`${API_CONFIG.username}:${API_CONFIG.password}`);
        
        // Fetch data from API
        const response = await fetch(API_CONFIG.url, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const patients = await response.json();
        console.log('✅ Patient data loaded successfully');
        console.log(`Total patients: ${patients.length}`);

        // Find Jessica Taylor
        const jessica = patients.find(patient => patient.name === "Jessica Taylor");

        if (!jessica) {
            throw new Error('Jessica Taylor not found in patient data');
        }

        console.log('✅ Jessica Taylor data found:', jessica);

        // Populate the UI with Jessica's data
        populatePatientInfo(jessica);
        populateDiagnosticCards(jessica);
        populateLabResults(jessica);
        createBloodPressureChart(jessica);

    } catch (error) {
        console.error('❌ Error loading patient data:', error);
        showError('Failed to load patient data. Please refresh the page.');
    }
}

/**
 * Populate patient information section
 */
function populatePatientInfo(patient) {
    // Update profile photo
    const profilePhoto = document.getElementById('profile-photo');
    const patientListPhoto = document.getElementById('patient-list-photo');
    
    if (profilePhoto && patient.profile_picture) {
        profilePhoto.src = patient.profile_picture;
    }
    if (patientListPhoto && patient.profile_picture) {
        patientListPhoto.src = patient.profile_picture;
    }

    // Update profile name
    const profileName = document.getElementById('profile-name');
    if (profileName) {
        profileName.textContent = patient.name;
    }

    // Update date of birth
    const dobElement = document.getElementById('patient-dob');
    if (dobElement && patient.date_of_birth) {
        // Format: 08/23/1996 to August 23, 1996
        dobElement.textContent = formatDateOfBirth(patient.date_of_birth);
    }

    // Update gender
    const genderElement = document.getElementById('patient-gender');
    if (genderElement) {
        genderElement.textContent = patient.gender;
    }

    // Update phone number
    const phoneElement = document.getElementById('patient-phone');
    if (phoneElement) {
        phoneElement.textContent = patient.phone_number;
    }

    // Update emergency contact
    const emergencyElement = document.getElementById('patient-emergency');
    if (emergencyElement) {
        emergencyElement.textContent = patient.emergency_contact;
    }

    // Update insurance provider
    const insuranceElement = document.getElementById('patient-insurance');
    if (insuranceElement && patient.insurance_type) {
        insuranceElement.textContent = patient.insurance_type;
    }

    console.log('✅ Patient information populated');
}

/**
 * Format date of birth from MM/DD/YYYY to Month DD, YYYY
 */
function formatDateOfBirth(dateString) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Handle both formats: MM/DD/YYYY and YYYY-MM-DD
    let month, day, year;
    
    if (dateString.includes('/')) {
        const parts = dateString.split('/');
        month = parseInt(parts[0]) - 1;
        day = parts[1];
        year = parts[2];
    } else if (dateString.includes('-')) {
        const parts = dateString.split('-');
        year = parts[0];
        month = parseInt(parts[1]) - 1;
        day = parts[2];
    }

    return `${months[month]} ${day}, ${year}`;
}

/**
 * Populate diagnostic cards with latest vital signs
 */
function populateDiagnosticCards(patient) {
    if (!patient.diagnosis_history || patient.diagnosis_history.length === 0) {
        console.warn('No diagnosis history available');
        return;
    }

    // Get the most recent diagnosis (first item in array)
    const latest = patient.diagnosis_history[0];
    console.log('Latest diagnosis:', latest);

    // Respiratory Rate
    const respiratoryValue = document.getElementById('respiratory-value');
    const respiratoryStatus = document.getElementById('respiratory-status');
    if (respiratoryValue && latest.respiratory_rate) {
        respiratoryValue.textContent = `${latest.respiratory_rate.value} bpm`;
        if (respiratoryStatus) {
            respiratoryStatus.textContent = latest.respiratory_rate.levels;
        }
    }

    // Temperature
    const temperatureValue = document.getElementById('temperature-value');
    const temperatureStatus = document.getElementById('temperature-status');
    if (temperatureValue && latest.temperature) {
        temperatureValue.textContent = `${latest.temperature.value}°F`;
        if (temperatureStatus) {
            temperatureStatus.textContent = latest.temperature.levels;
        }
    }

    // Heart Rate
    const heartrateValue = document.getElementById('heartrate-value');
    const heartrateStatus = document.getElementById('heartrate-status');
    if (heartrateValue && latest.heart_rate) {
        heartrateValue.textContent = `${latest.heart_rate.value} bpm`;
        if (heartrateStatus) {
            const statusText = heartrateStatus.querySelector('span');
            if (statusText) {
                statusText.textContent = latest.heart_rate.levels;
            }
        }
    }

    console.log('✅ Diagnostic cards populated');
}

/**
 * Populate lab results section
 */
function populateLabResults(patient) {
    const labResultsContainer = document.getElementById('lab-results');
    
    if (!labResultsContainer) {
        return;
    }

    // Clear existing content
    labResultsContainer.innerHTML = '';

    if (patient.lab_results && patient.lab_results.length > 0) {
        patient.lab_results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'lab-result-item';
            resultItem.innerHTML = `
                <span class="lab-result-name">${result}</span>
                <i class="fas fa-download lab-result-icon"></i>
            `;
            labResultsContainer.appendChild(resultItem);
        });
        console.log('✅ Lab results populated');
    } else {
        labResultsContainer.innerHTML = '<p style="color: var(--color-text-secondary);">No lab results available</p>';
    }
}

/**
 * Create blood pressure chart using Chart.js
 */
function createBloodPressureChart(patient) {
    if (!patient.diagnosis_history || patient.diagnosis_history.length === 0) {
        console.warn('No diagnosis history available for chart');
        return;
    }

    // Get last 6 months of data and reverse to show oldest to newest
    const last6Months = patient.diagnosis_history.slice(0, 6).reverse();

    // Extract data for chart
    const labels = last6Months.map(record => `${record.month.substring(0, 3)}, ${record.year}`);
    const systolicData = last6Months.map(record => record.blood_pressure.systolic.value);
    const diastolicData = last6Months.map(record => record.blood_pressure.diastolic.value);

    console.log('Chart Labels:', labels);
    console.log('Systolic Data:', systolicData);
    console.log('Diastolic Data:', diastolicData);

    // Update current BP values and status
    const latestRecord = patient.diagnosis_history[0];
    updateBloodPressureStats(latestRecord);

    // Get canvas element
    const canvas = document.getElementById('bloodPressureChart');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    const ctx = canvas.getContext('2d');

    // Destroy existing chart if it exists
    if (bloodPressureChartInstance) {
        bloodPressureChartInstance.destroy();
    }

    // Create new chart
    bloodPressureChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Systolic',
                    data: systolicData,
                    borderColor: '#E66FD2',
                    backgroundColor: 'rgba(230, 111, 210, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#E66FD2',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 8
                },
                {
                    label: 'Diastolic',
                    data: diastolicData,
                    borderColor: '#8C6FE6',
                    backgroundColor: 'rgba(140, 111, 230, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#8C6FE6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#ddd',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    min: 60,
                    max: 180,
                    ticks: {
                        stepSize: 20,
                        color: '#072635',
                        font: {
                            size: 12,
                            family: 'Manrope'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        color: '#072635',
                        font: {
                            size: 12,
                            family: 'Manrope'
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    console.log('✅ Blood pressure chart created');
}

/**
 * Update blood pressure stats (Systolic/Diastolic values and status)
 */
function updateBloodPressureStats(latestRecord) {
    // Systolic
    const systolicValue = document.getElementById('systolic-value');
    const systolicStatus = document.getElementById('systolic-status');
    
    if (systolicValue && latestRecord.blood_pressure.systolic) {
        systolicValue.textContent = latestRecord.blood_pressure.systolic.value;
        
        if (systolicStatus) {
            const statusSpan = systolicStatus.querySelector('span');
            if (statusSpan) {
                statusSpan.textContent = latestRecord.blood_pressure.systolic.levels;
            }
        }
    }

    // Diastolic
    const diastolicValue = document.getElementById('diastolic-value');
    const diastolicStatus = document.getElementById('diastolic-status');
    
    if (diastolicValue && latestRecord.blood_pressure.diastolic) {
        diastolicValue.textContent = latestRecord.blood_pressure.diastolic.value;
        
        if (diastolicStatus) {
            const statusSpan = diastolicStatus.querySelector('span');
            if (statusSpan) {
                statusSpan.textContent = latestRecord.blood_pressure.diastolic.levels;
            }
        }
    }
}

/**
 * Show error message to user
 */
function showError(message) {
    const container = document.querySelector('.container');
    if (container) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #ff4444;
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            font-family: 'Manrope', sans-serif;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        // Remove error after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Export functions for testing (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadPatientData,
        populatePatientInfo,
        populateDiagnosticCards,
        createBloodPressureChart
    };
}