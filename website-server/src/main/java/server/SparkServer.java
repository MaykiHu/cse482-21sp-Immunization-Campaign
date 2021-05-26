/*
 * Credit to Spring 2020 CSE 331 server material, with route modifications
 * This would be the backend support where the website requests to this server
 */

package server;

import server.utils.CORSFilter;
import com.google.gson.Gson;
import spark.Request;
import spark.ResponseTransformer;
import spark.Spark;

import javax.servlet.MultipartConfigElement;
import javax.servlet.ServletException;
import javax.servlet.http.Part;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Collection;
import java.util.Iterator;
import java.util.stream.Collectors;

public class SparkServer {

    // GSon to convert to JSon
    private static final Gson gson = new Gson();

    public static void main(String[] args) {
        CORSFilter corsFilter = new CORSFilter();
        corsFilter.apply();
        // The above two lines help set up some settings that allow the
        // React application to make requests to the Spark server, even though it
        // comes from a different server.
        // You should leave these two lines at the very beginning of main().

        // Add user uploaded files here
        File storageDir = new File("uploads");
        if (!storageDir.isDirectory()) storageDir.mkdir();

        // TODO: Create all the Spark Java routes you need here.

        // Sample arrays of info on countries and districts
        String[] countries = {"Kenya", "Uganda", "Zimbabwe", "Benin", "Mali"};

        // Silly test for hello world to check plugin connection
        Spark.get("/hello", (req, res) -> "Hello World!");

        Spark.get("/countries", (req, res) -> gson.toJson(countries));
        Spark.get("/Uganda-districts",
                (req, res) -> gson.toJson(districts("Uganda")));
        Spark.get("/Kenya-districts",
                (req, res) -> gson.toJson(districts("Kenya")));
        Spark.get("/Zimbabwe-districts",
                (req, res) -> gson.toJson(districts("Zimbabwe")));
        Spark.get("/Benin-districts",
                (req, res) -> gson.toJson(districts("Benin")));
        Spark.get("/Mali-districts",
                (req, res) -> gson.toJson(districts("Mali")));

        // Request route to download specified file by param (/download/someFileName)
        // Taking it out since CORS policy needs to be fixed, but will implement this
        // on backServer.py
        //Spark.get("/download/:file", (req, res) ->
        //        downloadFile(req.params(":file")));

        // For saving uploads/data from user
        Spark.post("/submitFiles", (req, res) -> uploadFile(req));
    }

    // Private helper to create dummy districts for a country
    // @param country, a String of the country
    // @return an array of said country's districts
    private static String[] districts(String country) {
        String[] districts = new String[100];
        for (int i = 0; i < districts.length; i++) {
            districts[i] = country + " DISTRICT " + i;
        }
        return districts;
    }

    // Uploading file to uploads folder under website-server (local)
    // Modified from a Medium post
    private static String uploadFile(Request request) {
        // TO allow for multipart file uploads
        request.attribute("org.eclipse.jetty.multipartConfig", new MultipartConfigElement(""));
        try {
            Collection<Part> fileParts = request.raw().getParts();

            // Iterate the files
            for (Iterator<Part> ptItr = fileParts.iterator(); ptItr.hasNext(); ) {
                Part filePart = ptItr.next();
                // The name of the file user uploaded
                String uploadedFileName = filePart.getSubmittedFileName();
                InputStream stream = filePart.getInputStream();
                // Write stream to file under uploads folder
                Files.copy(stream, Paths.get("uploads").resolve(uploadedFileName), StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException | ServletException e) {
            return "Exception occurred while uploading file" + e.getMessage();
        }
        return "File successfully uploaded";
    }

    // Download file from website-server downloads; templates provided for the user (local)
    // Modified from a Medium post
    private static String downloadFile(String fileName) {
        Path filePath = Paths.get("downloads").resolve(fileName);
        File file = filePath.toFile();
        if (file.exists()) {
            try {
                // Read from file and join all the lines into a string
                return Files.readAllLines(filePath).stream().collect(Collectors.joining());
            } catch (IOException e) {
                return "Exception occurred while reading file" + e.getMessage();
            }
        }
        return "File doesn't exist. Cannot download";
    }

}