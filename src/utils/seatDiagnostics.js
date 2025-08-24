import { db } from '@/lib/firebase';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';

/**
 * Diagnostic function to understand current seat state
 */
export async function diagnoseSeatState() {
  console.log('🔍 Starting seat state diagnosis...');
  
  try {
    // Get all seat availability documents
    const availabilityQuery = query(collection(db, 'seatAvailability'));
    const availabilitySnap = await getDocs(availabilityQuery);
    
    console.log(`📊 Found ${availabilitySnap.docs.length} seat availability documents`);
    
    let totalSeats = 0;
    let bookedSeats = 0;
    let blockedSeats = 0;
    let availableSeats = 0;
    let problematicSeats = [];
    
    for (const availabilityDoc of availabilitySnap.docs) {
      const availabilityData = availabilityDoc.data();
      const seats = availabilityData.seats || {};
      
      console.log(`\n📋 Document: ${availabilityDoc.id}`);
      console.log(`   Total seats in document: ${Object.keys(seats).length}`);
      
      for (const [seatId, seatData] of Object.entries(seats)) {
        totalSeats++;
        
        console.log(`\n🪑 Seat: ${seatId}`);
        console.log(`   blocked: ${seatData.blocked}`);
        console.log(`   booked: ${seatData.booked}`);
        console.log(`   bookingId: ${seatData.bookingId || 'none'}`);
        console.log(`   expiryTime: ${seatData.expiryTime || 'none'}`);
        console.log(`   expiryTime type: ${typeof seatData.expiryTime}`);
        console.log(`   userId: ${seatData.userId || 'none'}`);
        console.log(`   customerName: ${seatData.customerName || 'none'}`);
        
        if (seatData.blocked) {
          blockedSeats++;
          
          // Check if this is a problematic blocked seat
          if (!seatData.expiryTime) {
            problematicSeats.push({
              seatId,
              issue: 'blocked but no expiry time',
              document: availabilityDoc.id,
              data: seatData
            });
          } else {
            // Try to parse the expiry time
            try {
              let expiryTime;
              if (seatData.expiryTime instanceof Date) {
                expiryTime = seatData.expiryTime;
              } else if (seatData.expiryTime?.toDate) {
                expiryTime = seatData.expiryTime.toDate();
              } else if (seatData.expiryTime?.seconds) {
                expiryTime = new Date(seatData.expiryTime.seconds * 1000);
              } else {
                expiryTime = new Date(seatData.expiryTime);
              }
              
              if (isNaN(expiryTime.getTime())) {
                problematicSeats.push({
                  seatId,
                  issue: 'invalid expiry time format',
                  document: availabilityDoc.id,
                  data: seatData
                });
              } else {
                const now = new Date();
                const isExpired = expiryTime < now;
                const timeLeft = Math.round((expiryTime - now) / 1000 / 60);
                
                console.log(`   ⏰ Expiry: ${expiryTime.toISOString()}`);
                console.log(`   ⏳ Time left: ${timeLeft} minutes`);
                console.log(`   💀 Is expired: ${isExpired}`);
                
                if (isExpired) {
                  problematicSeats.push({
                    seatId,
                    issue: 'expired blocked seat',
                    document: availabilityDoc.id,
                    data: seatData,
                    expiredBy: Math.abs(timeLeft)
                  });
                }
              }
            } catch (error) {
              problematicSeats.push({
                seatId,
                issue: 'expiry time parsing error: ' + error.message,
                document: availabilityDoc.id,
                data: seatData
              });
            }
          }
        } else if (seatData.booked) {
          bookedSeats++;
          
          // Check if this is actually a pending payment seat
          if (seatData.bookingId) {
            // Check booking status
            try {
              const bookingRef = doc(db, 'bookings', seatData.bookingId);
              const bookingDoc = await getDoc(bookingRef);
              
              if (bookingDoc.exists()) {
                const booking = bookingDoc.data();
                console.log(`   📋 Booking status: ${booking.status}`);
                console.log(`   💳 Payment status: ${booking.payment?.status || 'none'}`);
                
                if (booking.status === 'pending_payment') {
                  problematicSeats.push({
                    seatId,
                    issue: 'marked as booked but payment pending',
                    document: availabilityDoc.id,
                    data: seatData,
                    bookingStatus: booking.status
                  });
                }
              } else {
                problematicSeats.push({
                  seatId,
                  issue: 'booked but booking document not found',
                  document: availabilityDoc.id,
                  data: seatData
                });
              }
            } catch (error) {
              console.error(`   ❌ Error checking booking: ${error.message}`);
            }
          }
        } else {
          availableSeats++;
        }
      }
    }
    
    console.log(`\n📈 DIAGNOSIS SUMMARY:`);
    console.log(`   Total seats: ${totalSeats}`);
    console.log(`   Available seats: ${availableSeats}`);
    console.log(`   Blocked seats: ${blockedSeats}`);
    console.log(`   Booked seats: ${bookedSeats}`);
    console.log(`   Problematic seats: ${problematicSeats.length}`);
    
    if (problematicSeats.length > 0) {
      console.log(`\n🚨 PROBLEMATIC SEATS:`);
      problematicSeats.forEach((problem, index) => {
        console.log(`\n${index + 1}. Seat ${problem.seatId} (${problem.document})`);
        console.log(`   Issue: ${problem.issue}`);
        if (problem.expiredBy) {
          console.log(`   Expired by: ${problem.expiredBy} minutes`);
        }
        if (problem.bookingStatus) {
          console.log(`   Booking status: ${problem.bookingStatus}`);
        }
      });
    }
    
    return {
      success: true,
      summary: {
        totalSeats,
        availableSeats,
        blockedSeats,
        bookedSeats,
        problematicSeats: problematicSeats.length
      },
      problems: problematicSeats
    };
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
    return { success: false, error: error.message };
  }
}
