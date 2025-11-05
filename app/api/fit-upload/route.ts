import { NextRequest, NextResponse } from 'next/server';
import FitParser from 'fit-file-parser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.fit')) {
      return NextResponse.json(
        { error: 'File must be a .fit file' },
        { status: 400 }
      );
    }

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse FIT file
    const fitParser = new FitParser({
      force: true,
      speedUnit: 'km/h',
      lengthUnit: 'km',
      temperatureUnit: 'celsius',
      elapsedRecordField: true,
      mode: 'list',
    });

    interface FitRecord {
      position_lat?: number;
      position_long?: number;
      altitude?: number;
      enhanced_altitude?: number;
      distance?: number;
    }

    interface FitData {
      records?: FitRecord[];
    }

    return new Promise<NextResponse>((resolve) => {
      fitParser.parse(buffer, (error: Error | null, data: unknown) => {
        if (error) {
          resolve(
            NextResponse.json(
              { error: 'Failed to parse FIT file', details: error.message },
              { status: 400 }
            )
          );
          return;
        }

        // Extract record data points
        const fitData = data as FitData;
        const records = fitData.records || [];
        
        // Debug: Log first record to see available fields
        if (records.length > 0) {
          console.log('Sample FIT record fields:', Object.keys(records[0]));
          console.log('Sample record:', records[0]);
        }
        
        const points = records
          .filter((record: FitRecord) => 
            record.position_lat !== undefined && 
            record.position_long !== undefined &&
            record.distance !== undefined &&
            // Check for altitude data (prefer enhanced_altitude if available)
            (record.enhanced_altitude !== undefined || record.altitude !== undefined)
          )
          .map((record: FitRecord) => ({
            lat: record.position_lat!,
            lng: record.position_long!,
            // Prefer enhanced_altitude over altitude if available
            elevation: record.enhanced_altitude ?? record.altitude!,
            distance: record.distance! * 1000, // Convert km to meters
          }));

        if (points.length === 0) {
          // Check if we have records but no altitude data
          const recordsWithPosition = records.filter((record: FitRecord) =>
            record.position_lat !== undefined && 
            record.position_long !== undefined &&
            record.distance !== undefined
          );
          
          if (recordsWithPosition.length > 0) {
            console.log('Found records with position but no altitude data');
            resolve(
              NextResponse.json(
                { error: 'No valid GPS data with elevation found in FIT file. The file may not contain altitude information.' },
                { status: 400 }
              )
            );
            return;
          }
          
          resolve(
            NextResponse.json(
              { error: 'No valid GPS data found in FIT file' },
              { status: 400 }
            )
          );
          return;
        }
        
        // Debug: Log elevation range
        const elevations = points.map(p => p.elevation);
        const minElev = Math.min(...elevations);
        const maxElev = Math.max(...elevations);
        console.log(`Elevation range: ${minElev}m to ${maxElev}m`);
        console.log(`Total points with elevation: ${points.length}`);

        resolve(
          NextResponse.json({
            success: true,
            points,
            totalPoints: points.length,
          })
        );
      });
    });
  } catch (error) {
    console.error('Error processing FIT file:', error);
    return NextResponse.json(
      { error: 'Failed to process FIT file' },
      { status: 500 }
    );
  }
}
