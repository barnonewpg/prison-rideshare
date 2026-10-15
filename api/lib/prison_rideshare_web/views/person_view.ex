defmodule PrisonRideshareWeb.PersonView do
  use PrisonRideshareWeb, :view
  use JaSerializer.PhoenixView

  def type(_, _), do: "people"

  attributes([
    :name,
    :email,
    :mobile,
    :landline,
    :address,
    :notes,
    :self_notes,
    :medium,
    :active,
    :inserted_at,
    :updated_at
  ])

  # Only the people index computes this; people are also included in ride
  # payloads, where omitting it avoids overwriting the indexed value
  def attributes(person, conn) do
    attributes = super(person, conn)

    case person.last_ride_start do
      :not_loaded -> attributes
      nil -> Map.put(attributes, :last_ride_start, nil)
      start -> Map.put(attributes, :last_ride_start, "#{NaiveDateTime.to_iso8601(start)}Z")
    end
  end
end
