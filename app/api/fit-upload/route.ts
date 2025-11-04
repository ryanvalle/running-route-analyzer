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
        const points = records
          .filter((record: FitRecord) => 
            record.position_lat !== undefined && 
            record.position_long !== undefined &&
            record.altitude !== undefined &&
            record.distance !== undefined
          )
          .map((record: FitRecord) => ({
            lat: record.position_lat!,
            lng: record.position_long!,
            elevation: record.altitude!,
            distance: record.distance! * 1000, // Convert km to meters
          }));

        if (points.length === 0) {
          resolve(
            NextResponse.json(
              { error: 'No valid GPS data found in FIT file' },
              { status: 400 }
            )
          );
          return;
        }

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
