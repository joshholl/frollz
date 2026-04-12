import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {


    await knex("tag").insert([
        {id: 1, name: "expired", color_code: "#ff0000",description: "Film that is past its expiration date. Results may vary."  },
        {id: 2, name: "black and white", color_code: "#808080", description: "Film that produces monochromatic images, typically in shades of gray."},
        {id: 3, name: "color", color_code: "#00ff00", description: "Film that produces colorful images."},
        {id: 4, name: "slide", color_code: "#0000ff", description: "Film that produces positive images on a transparent base."},
        {id: 5, name: "motion picture", color_code: "#ffff00", description: "Film designed for capturing moving images in a cinema or video format."},
    ]).onConflict("id").merge();
}