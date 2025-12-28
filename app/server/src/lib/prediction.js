import { Incident } from '../models/Incident.js';
import { User } from '../models/User.js';
//new
// Function to analyze historical data and predict incident hotspots
export const analyzeHotspots = async () => {
  try {
    // Get incidents from the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentIncidents = await Incident.find({
      reportedAt: { $gte: thirtyDaysAgo },
      status: { $ne: 'resolved' }
    }).select('location.severity location.lat location.lng type reportedAt');

    // Group incidents by location clusters
    const clusters = groupIncidentsByLocation(recentIncidents);
    
    // Calculate hotspot scores based on frequency and severity
    const hotspots = clusters.map(cluster => {
      const score = calculateHotspotScore(cluster.incidents);
      return {
        location: cluster.center,
        incidents: cluster.incidents.length,
        score,
        type: cluster.type,
        severity: cluster.severity
      };
    });

    // Return top 10 hotspots
    return hotspots.sort((a, b) => b.score - a.score).slice(0, 10);
  } catch (error) {
    console.error('Error analyzing hotspots:', error);
    return [];
  }
};

// Group incidents by location using a simple clustering algorithm
const groupIncidentsByLocation = (incidents) => {
  const clusters = [];
  const threshold = 0.001; // Approx 111 meters at equator

  for (const incident of incidents) {
    let assigned = false;
    
    for (const cluster of clusters) {
      const distance = calculateDistance(
        incident.location.lat, 
        incident.location.lng, 
        cluster.center.lat, 
        cluster.center.lng
      );
      
      if (distance < threshold) {
        cluster.incidents.push(incident);
        assigned = true;
        break;
      }
    }
    
    if (!assigned) {
      clusters.push({
        center: { 
          lat: incident.location.lat, 
          lng: incident.location.lng 
        },
        incidents: [incident],
        type: incident.type,
        severity: incident.severity
      });
    }
  }
  
  return clusters;
};

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lng2 - lng1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};

// Calculate hotspot score based on frequency and severity
const calculateHotspotScore = (incidents) => {
  let score = 0;
  
  for (const incident of incidents) {
    // Weight by severity and recency
    const severityWeight = {
      'critical': 5,
      'high': 4,
      'medium': 3,
      'low': 1
    }[incident.location.severity] || 1;
    
    // More recent incidents have higher weight
    const daysAgo = (Date.now() - new Date(incident.reportedAt).getTime()) / (1000 * 60 * 60 * 24);
    const recencyWeight = Math.max(0.5, 2 - (daysAgo / 7)); // More recent = higher weight
    
    score += severityWeight * recencyWeight;
  }
  
  return score;
};

// Function to predict potential incidents based on historical patterns
export const predictIncidents = async (location, timeRange = 24) => {
  try {
    // Get historical incidents near the location
    const nearbyThreshold = 0.01; // Approx 1.1 km radius
    const historicalNearby = await Incident.find({
      'location.lat': { 
        $gte: location.lat - nearbyThreshold, 
        $lte: location.lat + nearbyThreshold 
      },
      'location.lng': { 
        $gte: location.lng - nearbyThreshold, 
        $lte: location.lng + nearbyThreshold 
      },
      reportedAt: { 
        $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
      }
    }).select('type severity reportedAt location');

    // Analyze patterns and predict likely incident types
    const predictions = analyzePatterns(historicalNearby, timeRange);
    
    return predictions;
  } catch (error) {
    console.error('Error predicting incidents:', error);
    return [];
  }
};

// Analyze historical patterns to predict future incidents
const analyzePatterns = (historicalIncidents, timeRange) => {
  // Group by incident type and calculate frequency
  const typeFrequency = {};
  
  for (const incident of historicalIncidents) {
    if (!typeFrequency[incident.type]) {
      typeFrequency[incident.type] = { count: 0, severity: incident.severity };
    }
    typeFrequency[incident.type].count++;
  }

  // Calculate probability based on historical frequency
  const totalIncidents = historicalIncidents.length;
  const predictions = [];

  for (const [type, data] of Object.entries(typeFrequency)) {
    const probability = data.count / totalIncidents;
    
    // Only include types with reasonable probability (> 5%)
    if (probability > 0.05) {
      predictions.push({
        type,
        severity: data.severity,
        probability: Math.round(probability * 100),
        expectedTimeframe: `${timeRange} hours`
      });
    }
  }

  return predictions.sort((a, b) => b.probability - a.probability);
};