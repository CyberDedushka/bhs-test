import * as AWS from 'aws-sdk';


const s3 = new AWS.S3();
const bucketName = 'your-bucket-name'; 

exports.handler = async (event: any = {}): Promise<any> => {

  const orderId = event.orderId; 

  //Presigned URL
  const params = {
    Bucket: bucketName,
    Key: `${orderId}.pdf`, 
    Expires: 60 * 5, 
  };

  try {
    const url = await s3.getSignedUrlPromise('getObject', params);
    return {
      statusCode: 200,
      body: JSON.stringify({
        url: url,
      }),
    };
  } catch (error) {
    console.error(error);
    let errorMessage: string;
    if (error instanceof Error) {
      // Now TypeScript knows `error` is of type Error, and `error.message` is safe to access.
      errorMessage = error.message;
    } else {
      // If it's not an Error object, handle accordingly. 
      // This branch is a safeguard.
      errorMessage = 'An unknown error occurred';
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Could not generate the presigned URL",
        error: errorMessage,
      }),
    };
  }
};
