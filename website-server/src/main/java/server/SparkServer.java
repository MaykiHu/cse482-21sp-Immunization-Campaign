/*
 * Credit to Spring 2020 CSE 331 server material, with route modifications
 * This would be the backend support where the website requests to this server
 */

package server;

import server.utils.CORSFilter;
import com.google.gson.Gson;
import spark.Spark;

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

        // TODO: Create all the Spark Java routes you need here.

        // Sample arrays of info on countries and districts
        String[] countries = {"Kenya", "Uganda", "Zimbabwe", "Benin", "Mali"};
        String[] districts = {"District 1", "District 2"};

        // Silly test for hello world to check plugin connection
        Spark.get("/hello", (req, res) -> "Hello World!");

        Spark.get("/countries", (req, res) -> gson.toJson(countries));
        Spark.get("/districts", (req, res) -> gson.toJson(districts));
    }

}
